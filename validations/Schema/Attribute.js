const Joi = require("joi");

exports.JoiAttributeSchema = Joi.object({
  name: Joi.string().required().error(new Error("Name Is Required")),
  attribute_values: Joi.array()
    .items({
      name: Joi.string().required(),
    })
    .required()
    .error(new Error("Please Select Attribute Values")),
  status: Joi.string().required().error(new Error("Status Is Required")),
});
