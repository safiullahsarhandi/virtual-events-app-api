const stripe = require("stripe")(process.env.STRIPE_KEY);

exports.createCustomerStripe = async (
  user,
  email,
  card_number,
  card_expiration_month,
  card_expiration_year,
  card_cvv
) => {
  let customer;
  const token = await stripe.tokens.create({
    card: {
      number: card_number,
      exp_month: card_expiration_month,
      exp_year: card_expiration_year,
      cvc: card_cvv,
    },
  });

  if (user.stripe_customer && user.stripe_customer.id) {
    customer = await stripe.customers.update(user.stripe_customer.id, {
      email: email,
      source: token.id,
    });
  } else {
    customer = await stripe.customers.create({
      email: email,
      source: token.id,
    });
  }

  return customer;
};

exports.makePayment = async (
  card_number,
  card_expiration_month,
  card_expiration_year,
  card_cvv,
  total,
  customer
) => {
  try {
    const token = await stripe.tokens.create({
      card: {
        number: card_number,
        exp_month: card_expiration_month,
        exp_year: card_expiration_year,
        cvc: card_cvv,
      },
    });
    if (!token.id)
      throw new Error(
        "Something went wrong while processing payment. You haven't been charged"
      );
    if (!customer.id)
      throw new Error(
        "Something went wrong while processing payment. You haven't been charged"
      );
    return stripe.charges.create({
      amount: parseFloat(total) * 100,
      description: `Subscription Purchase For Travel Holics`,
      currency: "gbp",
      customer: customer.id,
    });
  } catch (err) {
    throw err;
  }
};

exports.refundPayment = async (charge, amount) => {
  try {
    const refund = await stripe.refunds.create({
      charge,
      amount: amount * 100,
    });
    return refund;
  } catch (err) {
    throw err;
  }
};
