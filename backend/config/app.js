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
    maxRequests: parseInt(process.env.RATELIMIT) || 2, // mind that 1 request needs to be done for auth
    ttl: 60 * 1000 // 1 minute
  },
  key: process.env.KEY || '8F03DC2E86EFD74C2B092770A95B3062'
}
