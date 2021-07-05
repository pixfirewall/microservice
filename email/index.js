const Redis = require("ioredis");
const sub = new Redis(6379, "redis");
const pub = new Redis(6379, "redis");
const redis = new Redis(6379, "redis");

/* valid token is required */
// const mailgun = require("mailgun-js")({
//   apiKey: "XXXXXXXXXXXX",
//   domain: "www.test.com",
// });

sub.subscribe("user-activation", (err, count) => {
  if (err) console.error(`Activation failed to subscribe: ${err.message}`);
  else console.log(`Activation is currently subscribed to ${count} channels.`);
});

sub.on("message", async (channel, email) => {
  console.log(`Received on Activation  => ${email} from ${channel}`);
  try {
    console.log(`Activating ${email} ...`);
    let userData = await redis.get(email);
    userData = JSON.parse(userData);

    /* to send an email, uncomments below section */
    // const data = {
    //   from: "Excited User <me@samples.mailgun.org>",
    //   to: email,
    //   subject: "Account Activation",
    //   text: "Your account has been activated!",
    // };
    // mailgun.messages().send(data);

    await redis.set(
      email,
      JSON.stringify({
        ...userData,
        active: true,
      })
    );

    pub.publish(
      "registration-result",
      JSON.stringify({
        status: true,
        message: "Your account has been created successfully",
        sessionId: userData.sessionId,
      })
    );
  } catch (e) {
    console.error(`Error => ${e.message}`);
  }
});
