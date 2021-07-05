const bcrypt = require("bcrypt");
const validator = require("validator");
const Redis = require("ioredis");
const sub = new Redis(6379, "redis");
const pub = new Redis(6379, "redis");
const redis = new Redis(6379, "redis");

sub.subscribe("user-registration", (err, count) => {
  if (err) console.error(`Registration failed to subscribe: ${err.message}`);
  else
    console.log(`Registration is currently subscribed to ${count} channels.`);
});

sub.on("message", async (channel, message) => {
  try {
    console.log(`Received on Registration  => ${message} from ${channel}`);

    const { sessionId, email, username, password } = JSON.parse(message);

    const isValidEmail = validator.isEmail(email);
    const isValidPassword = validator.isStrongPassword(password);
    const isExist = await redis.get(email);
    // const errorMessage =

    if (!isValidEmail || !isValidPassword || isExist)
      pub.publish(
        "registration-result",
        JSON.stringify({
          status: false,
          message: isExist
            ? "User is already registered."
            : !isValidEmail
            ? "Invalid Email!"
            : "Password should be in complex mode!",
          sessionId,
        })
      );
    else {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      await redis.set(
        email,
        JSON.stringify({
          email,
          username,
          password: hashedPassword,
          active: false,
          sessionId,
        })
      );
      pub.publish("user-activation", email);
    }
  } catch (e) {
    console.error(e.message);
  }
});
