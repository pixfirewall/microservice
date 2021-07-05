const WebSocket = require("ws");
const Redis = require("ioredis");
const read = new Redis(6379, "redis");
const write = new Redis(6379, "redis");

const connections = {};

const wss = new WebSocket.Server({ port: 8080 });
wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    const sessionId = await write.xadd(
      "user-registration",
      "*",
      "data",
      message
    );
    connections[sessionId] = ws;
  });
});

async function listenForMessage(lastId = "$") {
  const results = await read.xread(
    "block",
    0,
    "STREAMS",
    "registration-result",
    lastId
  );
  const [key, messages] = results[0];
  const { sessionId } = JSON.parse(messages[0][1][1]);
  connections[sessionId].send(messages[0][1][1]);

  await listenForMessage(messages[messages.length - 1][0]);
}

listenForMessage();
