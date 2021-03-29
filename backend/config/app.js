module.exports = {
  db: {
    host: process.env.MONGO_HOST || 'localhost',
    db: 'metrics',
    port: process.env.MONGO_PORT || 27017,
    username: process.env.MONGO_USER,
    password: process.env.MONGO_PSW,
    collections: {
      metric: {
        index: [{ id: 1, date: 1 }, { unique: true }],
        timeseries: true
      },
      // add below custom collections if any
      manufacturer: {
        index: [{ hex: 1 }, { unique: true }]
      },
      product: {
        index: [{ hex: 1, manufacturer: 1 }, { unique: true }]
      }
    }
  },
  port: process.env.PORT || '5000',
  rateLimit: {
    maxRequests: 2, // mind that 1 request needs to be done for auth
    ttl: 60 * 1000
  },
  secret: process.env.SECRET || '>rh^b9\'FcNJa{BL"ZoT)/d@(Yog`AF(}ANV`!_}qPss,EFX}BY~2@]R"&qRs75"',
  key: process.env.KEY || 'Og9O}$[wKk=<$Z*qUduK'
}
