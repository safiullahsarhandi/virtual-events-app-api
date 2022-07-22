const Validator = require('validatorjs');
module.exports = function (req,res, next) {
    const validation = new Validator(req.body,{
        name : 'required',
        phone : 'required',
    });
    if(validation.fails()){
        return res.code(422).send({errors : validation.errors.all(), status : false});
    }
    next();
  }