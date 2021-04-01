const Joi = require('joi')
const validator = require('express-joi-validation').createValidator({})

const schemas = {
  '/metrics': {
    body: Joi.object({
      collection: Joi.string(),
      data: Joi.array()
    })
  }
}

module.exports = function (apiName) {
  const validators = []
  for (const k in schemas[apiName]) {
    validators.push(validator[k](schemas[apiName][k]))
  }

  return validators
}
