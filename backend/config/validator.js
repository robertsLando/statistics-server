const Joi = require('joi')
const validator = require('express-joi-validation').createValidator({})

// for each api define the validators schemas
// available validators here are for `body` `query` `params` `headers` `respone` `fields`
// more info: https://www.npmjs.com/package/express-joi-validation#api
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
  for (const v in schemas[apiName]) {
    validators.push(validator[v](schemas[apiName][v]))
  }

  return validators
}
