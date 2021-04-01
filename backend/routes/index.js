const express = require('express')

const db = require('../db')
const { ConfigManager } = require('@zwave-js/config')
const { key, apis: APIs } = require('../config/app')
const createValidator = require('../config/validator')

const router = express.Router()

async function authMiddleware (req, res, next) {
  const token = req.headers['x-api-token']
  // third-party cookies must be allowed in order to work
  try {
    if (!token) {
      throw Error('Missing API token')
    }

    if (token === key) {
      next()
    } else {
      throw Error('Invalid API token')
    }
  } catch (error) {
    res.status(error.message === 'Invalid API token' ? 403 : 401).send(error.message)
  }
}

/* GET home page. */
router.post(APIs.metrics, authMiddleware, ...createValidator(APIs.metrics), async (req, res) => {
  try {
    const result = await db.upsert(req.body)
    res.json({ success: true, result })
  } catch (error) {
    console.error(error)
    res.json({ success: false, error: error.toString() })
  }
})

router.post(APIs.updateDb, authMiddleware, async (req, res) => {
  try {
    const manager = new ConfigManager()

    await manager.loadFulltextDeviceIndex()

    // https://zwave-js.github.io/node-zwave-js/#/api/config-manager?id=getfulltextindex
    const deviceIndex = manager.getFulltextIndex()

    const mIDs = {}
    const pIDs = {}

    for (const device of deviceIndex) {
      if (!mIDs[device.manufacturerId]) {
        mIDs[device.manufacturerId] = {
          hex: device.manufacturerId,
          name: device.manufacturer
        }
      }

      const id = `${device.manufacturerId}-${device.productId}`

      if (!pIDs[id]) {
        pIDs[id] = {
          hex: device.productId,
          name: device.label,
          manufacturer: device.manufacturerId,
          type: device.productType,
          description: device.description
        }
      }
    }

    const manufacturers = Object.keys(mIDs).map(m => mIDs[m])
    const products = Object.keys(pIDs).map(p => pIDs[p])

    await db.drop('manufacturer')
    await db.drop('product')

    await db.upsert({ collection: 'manufacturer', data: manufacturers, ignoreTime: true })
    await db.upsert({ collection: 'product', data: products, ignoreTime: true })

    res.json({ success: true, result: 'done' })
  } catch (error) {
    res.json({ success: false, error })
  }
})

module.exports = router
