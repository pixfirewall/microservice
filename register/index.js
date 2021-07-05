const bcrypt = require("bcrypt");
const validator = require("validator");
const Redis = require("ioredis");
const read = new Redis(6379, "redis");
const write = new Redis(6379, "redis");
const redis = new Redis(6379, "redis");

async function listenForMessage(lastId = "$") {
  const results = await read.xread(
    "block",
    0,
    "STREAMS",
    "user-registration",
    lastId
  );
  const [_, messages] = results[0];
  const data = JSON.parse(messages[0][1][1]);
  const { email, username, password } = data;
  const sessionId = messages[0][0];

  try {
    const isValidEmail = validator.isEmail(email);
    const isValidPassword = validator.isStrongPassword(password);
    const isExist = await redis.get(email);

    if (!isValidEmail || !isValidPassword || isExist)
      write.xadd(
        "registration-result",
        "*",
        "data",
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
      write.xadd("user-activation", "*", "data", email);
    }
  } catch (e) {
    console.error(e.message);
  }
  await listenForMessage(messages[messages.length - 1][0]);
}

listenForMessage();
