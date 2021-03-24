const { MongoClient } = require('mongodb')

const options = {
  host: process.env.MONGO_HOST || 'localhost',
  db: 'metrics',
  port: process.env.MONGO_PORT || 27017,
  username: process.env.MONGO_USER,
  password: process.env.MONGO_PSW
}
// Connection URI
const uri =
  `mongodb://${options.host}:${options.port}/?poolSize=20&writeConcern=majority`

// Create a new MongoClient
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const collections = {
  network: {
    index: [{ homeId: 1 }, { unique: true }]
  },
  device: {
    index: [{ network: 1, nodeId: 1 }, { unique: true }]
  },
  manufacturer: {
    index: [{ hex: 1 }, { unique: true }]
  },
  product: {
    index: [{ hex: 1, manufacturer: 1 }, { unique: true }]
  }
}

module.exports = {
  upsert: async (collection, data) => {
    if (!collections[collection]) {
      throw Error(`Collection ${collection} doesn't exists`)
    }
    const bulk = client.db(options.db).collection(collection).initializeOrderedBulkOp()
    const findQuery = Object.assign({}, collections[collection].index[0]) || {
      _id: null
    }

    for (const doc of data) {
      for (const k in findQuery) {
        findQuery[k] = doc[k]
        delete doc[k] // remove unique properties from the $set to prevent duplicat key error
      }
      bulk.find(findQuery).upsert().updateOne({ $set: doc })
    }

    await bulk.execute()
  },
  drop: async (collection) => {
    return client.db(options.db).dropCollection(collection)
  },
  init: async () => {
    await client.connect()
    await client.db('admin').command({ ping: 1 })
    const db = client.db(options.db)
    for (const c in collections) {
      const collection = await db.collection(c)
      await collection.createIndex(...collections[c].index)
    }
    console.log('MongoDB client connected successfully to server')
  },
  close: () => {
    console.log('Closing mongodb client...')
    return client.close()
  }
}
