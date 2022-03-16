const stripe = require("stripe")(process.env.STRIPE_KEY);

exports.RefundPaymentPartial = async (charge, amount) => {
  try {
    const refund = await stripe.refunds.create({
      charge: charge,
      amount,
    });
    return refund;
  } catch (err) {
    throw err;
  }
};
