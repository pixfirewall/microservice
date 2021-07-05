const Redis = require("ioredis");
const read = new Redis(6379, "redis");
const write = new Redis(6379, "redis");
const redis = new Redis(6379, "redis");

/* valid token is required */
// const mailgun = require("mailgun-js")({
//   apiKey: "XXXXXXXXXXXX",
//   domain: "www.test.com",
// });

function sendEmail(email) {
  const data = {
    from: "Excited User <me@samples.mailgun.org>",
    to: email,
    subject: "Account Activation",
    text: "Your account has been activated!",
  };
  mailgun.messages().send(data);
}

async function listenForMessage(lastId = "$") {
  const results = await read.xread(
    "block",
    0,
    "STREAMS",
    "user-activation",
    lastId
  );
  const [_, messages] = results[0];
  const email = messages[0][1][1];

  try {
    let userData = await redis.get(email);
    userData = JSON.parse(userData);
    const { sessionId } = userData;
    delete userData.sessionId;

    await redis.set(
      email,
      JSON.stringify({
        ...userData,
        active: true,
      })
    );

    /* sending email to user */
    // sendEmail(email)

    write.xadd(
      "registration-result",
      "*",
      "data",
      JSON.stringify({
        status: true,
        message: "Your account has been created successfully",
        sessionId,
      })
    );
  } catch (e) {
    console.error(e.message);
  }
  await listenForMessage(messages[messages.length - 1][0]);
}

listenForMessage();
