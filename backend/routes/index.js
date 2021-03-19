const express = require('express')
const db = require('../db')

const router = express.Router()

/* GET home page. */
router.post('/metrics', async (req, res) => {
  try {
    const { table, data } = req.body
    const result = await db.upsert(table, data)
    res.json({ success: true, result })
  } catch (error) {
    res.json({ success: false, error })
  }
})

module.exports = router
