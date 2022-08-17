/* const mongoose = require("mongoose");

module.exports = function payable(schema,options){
    let defaultOptions = {
        paymentModel : 'Payment',
        userKey : 'userId', 
        userKeyPayment :'user',
    }; 
    Object.assign(defaultOptions,options);
      
    schema.methods.savePayLog = async function(amount,amount_type,charge_object){
        console.log(schema);
        try {
            await mongoose[options.paymentModel].create({
              [defaultOptions.userKeyPayment]: this[defaultOptions.userId],
              payable_id : this._id,
              payable_type : 'Order',
              amount,
              amount_type,
              charge_object,
              payment_status : 'Payment Completed',
            });
        } catch (error) {
            console.log(error);
            throw new Error(error.message);
        }
      };
      schema.methods.pay = async function(cardId,amount) {
          try {
            
            let user = await User.findById(this.user);
            let charge = await user.charge(amount,cardId);
            this.savePayLog(amount,'Order Payment',charge);
          } catch (error) {
            throw new Error(error.message);
          }
      };
} */