const Card = require('../models/Card');
const User = require('../models/User');
const Stripe = require('stripe');
const { Types } = require('mongoose');

exports.createCard = async (req,res)=> {
    const stripe = Stripe(process.env.STRIPE_KEY);
    // let user = await User.findById(req.user.userId);
    try{
        let {expiry} = req.body;
        let [month,year] = expiry.split('/');
        var token = await stripe.tokens.create({
            card: {
              number: req.body.card_number,
              exp_month: month,
              exp_year: year,
              cvc: req.body.cvv,
            },
          });
    }catch(error){
        console.log(error);
        res.code(409).send({
            message : error.toString(),
            status : false,
        });
    }
    try {
        let {userId} = req.user;
        let user  = await User.findById(userId);

        const card = await stripe.customers.createSource(
            user.stripe_customer.id,
            {source: token.id}
        );

        let cardModel = await Card.create({
            userId : userId,
            cardId : card.id,
            last4 : card.last4,
            cardBrand : card.brand,
            expiry : req.body.expiry,
            cardHolder : req.body.card_holder,
        });

        res.code(201).send({
            status : true,
            card : cardModel,
            message : 'card created successfully',
        });
        
    } catch (error) {
        console.log(error);
        res.code(409).send({
            message : error.toString(),
            status : false,
        });
    }
      
}


exports.index = async(req,res)=> {

    try {
        let cards = await Card.find({
            userId : Types.ObjectId(req.user.userId),
        });

        res.send({
            cards
        });
    } catch (error) {
            console.log(error);
            res.code(409).send({
                message : error.toString(),
                status : false,
            });
    }
};

exports.destroy = async (req,res)=> {
     try {
        // await Card.deleteOne({
        //     _id : Types.ObjectId(req.params.id)
        // });
        res.code(200).send({
            message : 'card deleted successfully',
            status : true,
        });
     } catch (error) {
            console.log(error);

            res.code(500).send({
                message : error.toString(),
                status : false,
            });
     }

    // res.send();
};