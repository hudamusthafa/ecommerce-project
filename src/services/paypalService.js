const paypal = require("@paypal/checkout-server-sdk");

function environment() {

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (process.env.PAYPAL_MODE === "sandbox") {

        return new paypal.core.SandboxEnvironment(
            clientId,
            clientSecret
        );

    }

    return new paypal.core.LiveEnvironment(
        clientId,
        clientSecret
    );

}

const client = new paypal.core.PayPalHttpClient(
    environment()
);


// Create Order


exports.createOrder = async (amount) => {

    const request =
        new paypal.orders.OrdersCreateRequest();

    request.prefer("return=representation");

  request.requestBody({

    intent: "CAPTURE",

    application_context: {

        return_url:
            process.env.BASE_URL +
            "/checkout/paypal/success",

        cancel_url:
            process.env.BASE_URL +
            "/checkout/paypal/cancel",

        brand_name: "Aura",

        user_action: "PAY_NOW"

    },

    purchase_units: [

        {
            amount: {
                currency_code: "USD",
                value: amount.toFixed(2)
            }
        }

    ]

});
    const response =
        await client.execute(request);

    return response.result;

};


// Capture Payment


exports.captureOrder = async (orderId) => {

    const request =
        new paypal.orders.OrdersCaptureRequest(orderId);

    request.requestBody({});

    const response =
        await client.execute(request);

    return response.result;

};

