const express = require('express')
const db = require('../db')
const got = require('got')

const router = express.Router()

/* GET home page. */
router.post('/metrics', async (req, res) => {
  try {
    const { collection, data } = req.body
    const result = await db.upsert(collection, data)
    res.json({ success: true, result })
  } catch (error) {
    res.json({ success: false, error })
  }
})

router.post('/update-db', async (req, res) => {
  try {
    const response = await got('https://raw.githubusercontent.com/zwave-js/node-zwave-js/master/packages/config/config/manufacturers.json').json()

    const manufacturers = Object.keys(response).map(h => {
      return {
        hex: h,
        name: response[h]
      }
    })

    const result = await db.upsert('manufacturer', manufacturers)

    res.json({ success: true, result })
  } catch (error) {
    res.json({ success: false, error })
  }
})

module.exports = router
