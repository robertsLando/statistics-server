const express = require('express')

const db = require('../db')
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

// Default statistics endpoint. Validate the body and then put it into the DB
router.post(APIs.statistics, authMiddleware, ...createValidator(APIs.statistics), async (req, res) => {
  try {
    const result = await db.upsert(req.body)
    res.json({ success: true, result })
  } catch (error) {
    console.error(error)
    res.json({ success: false, error: error.toString() })
  }
})

// Implement custom API endpoints if you need any
// router.post(APIs.updateDb, authMiddleware, async (req, res) => {
//   try {
//     // Do something
//     res.json({ success: true, result: 'done' })
//   } catch (error) {
//     res.json({ success: false, error })
//   }
// })

module.exports = router
