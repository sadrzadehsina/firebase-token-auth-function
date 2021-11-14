const functions = require("firebase-functions");

const cors = require("cors")({ origin: true });

const admin = require("firebase-admin");

const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`,
});

exports.auth = functions.https.onRequest((req, res) => {
  const handleError = (token, error) => {
    functions.logger.error({ Token: toke }, error);
    res.sendStatus(500);
    return;
  };

  const handleResponse = (token, status, body) => {
    functions.logger.log(
      { Token: token },
      {
        Response: {
          Status: status,
          Body: body,
        },
      }
    );

    if (body) {
      return res.status(200).json(body);
    }
    return res.sendStatus(status);
  };

  let token = "";

  try {
    return cors(req, res, async () => {
      if (!req.method === "POST") return handleResponse(token, 403);
      token = req.body.token;

      if (!token) return handleResponse(token, 400);

      const valid = await authenticate(token);

      if (!valid) return handleResponse(token, 401);

      const firebaseToken = await admin.auth().createCustomToken(token);
      return handleResponse(token, 200, { token: firebaseToken });
    });
  } catch (error) {
    return handleError(token, error);
  }
});

const authenticate = (token) => {
  const credential = { token };

  return new Promise((resolve, reject) => {
    if (credential.token === "sina123") resolve(true);
    else reject(new Error("Invalid Token"));
  });
};
