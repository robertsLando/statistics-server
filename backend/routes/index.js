const express = require('express')
const db = require('../db')
const { ConfigManager } = require('@zwave-js/config')
const { TokenExpiredError, sign, verify } = require('jsonwebtoken')
const { secret, key } = require('../config/app')

const router = express.Router()

function verifyJWT (token) {
  return new Promise((resolve, reject) => {
    verify(token, secret, function (err, decoded) {
      if (err) reject(err)
      else resolve(decoded)
    })
  })
}

async function authMiddleware (req, res, next) {
  let token = req.headers['x-access-token'] || req.headers.authorization // Express headers are auto converted to lowercase
  if (token && token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length)
  }

  // third-party cookies must be allowed in order to work
  try {
    if (!token) {
      throw Error('Invalid token header')
    }
    const decoded = await verifyJWT(token)

    if (decoded.ip === req.ip) {
      next()
    } else {
      throw Error('Token not valid')
    }
  } catch (error) {
    res.status(error instanceof TokenExpiredError ? 401 : 403).send(error.message)
  }
}

router.post('/auth', async (req, res) => {
  try {
    if (req.body && req.body.key === key) {
      const token = sign({ ip: req.ip }, secret, {
        expiresIn: '1d'
      })

      res.json({ success: true, token })
    } else {
      throw Error('Authentication failed')
    }
  } catch (error) {
    res.json({ success: false, error })
  }
})

/* GET home page. */
router.post('/metrics', authMiddleware, async (req, res) => {
  try {
    const result = await db.upsert(req.body)
    res.json({ success: true, result })
  } catch (error) {
    console.error(error)
    res.json({ success: false, error: error.toString() })
  }
})

router.post('/update-db', authMiddleware, async (req, res) => {
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
