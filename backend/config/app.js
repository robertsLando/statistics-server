module.exports = {
  db: {
    host: process.env.MONGO_HOST || 'localhost',
    db: 'statistics',
    port: process.env.MONGO_PORT || 27017,
    username: process.env.MONGO_USER,
    password: process.env.MONGO_PSW,
    collections: {
      statistics: {
        // Define which properties should be indexed
        index: [{ id: 1, date: 1 }, { unique: true }],
        // Define this collection as a time series. This means that a `date` and a `ts`
        // property get added automatically
        timeseries: true
      }
      // add custom collections below if you need any
      // product: {
      //   index: [{ manufacturerId: 1, productType: 1, productId: 1 }, { unique: true }]
      // }
    }
  },
  apis: {
    // Default API endpoint
    statistics: '/statistics'
    // Define custom endpoints below if you need any. Implementation goes into routes/index.js
    // updateDb: '/update-db'
  },
  port: process.env.PORT || '5000',
  rateLimit: {
    maxRequests: parseInt(process.env.RATELIMIT) || 2,
    ttl: 60 * 1000 // 1 minute
  },
  // When behind a reverse proxy, set this field to `true`, so the rate-limiter can see the user's external IP
  // Make sure to configure the proxy correctly. Details can be found at: http://expressjs.com/en/guide/behind-proxies.html
  // For nginx, the following config will do:
  //   proxy_set_header X-Forwarded-For $remote_addr
  //   proxy_set_header X-Forwarded-Host ""
  //   proxy_set_header X-Forwarded-Proto ""
  proxy: false,
  key: process.env.KEY
}
