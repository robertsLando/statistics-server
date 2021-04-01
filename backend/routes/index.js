const express = require('express')
const Joi = require('joi')
const validator = require('express-joi-validation').createValidator({})

const db = require('../db')
const { ConfigManager } = require('@zwave-js/config')
const { key } = require('../config/app')

const router = express.Router()

const bodySchema = Joi.object({
  collection: Joi.string(),
  data: Joi.array()
})

async function authMiddleware (req, res, next) {
  let token = req.headers['x-api-token']
  if (token && token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length)
  }

  // third-party cookies must be allowed in order to work
  try {
    if (!token) {
      throw Error('Invalid token header')
    }

    if (token === key) {
      next()
    } else {
      throw Error('Token not valid')
    }
  } catch (error) {
    res.status(error.message === 'Token not valid' ? 403 : 401).send(error.message)
  }
}

/* GET home page. */
router.post('/metrics', authMiddleware, validator.body(bodySchema), async (req, res) => {
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
