const Validator = require('validatorjs');
module.exports = function (req,res, next) {
    const validation = new Validator(req.body,{
        name : 'required',
        email : 'required',
        message : 'required',
    });
    if(validation.fails()){
        return res.code(422).send({errors : validation.errors.all(), status : false});
    }
    next();
  }