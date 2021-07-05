const WebSocket = require("ws");
const Redis = require("ioredis");
const sub = new Redis(6379, "redis");
const pub = new Redis(6379, "redis");
const uuid = require("uuid");

const connections = {};

sub.subscribe("registration-result", (err, count) => {
  if (err) console.error(`API-gateway failed to subscribe: ${err.message}`);
  else console.log(`API-gateway is currently subscribed to ${count} channels.`);
});

sub.on("message", (channel, message) => {
  console.log(`Received on API-gateway  => ${message} from ${channel}`);
  const { sessionId } = JSON.parse(message);
  connections[sessionId].send(message);
});

const wss = new WebSocket.Server({ port: 8080 });
wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const sessionId = uuid.v4();
    const sessionMessage = {
      sessionId,
      ...JSON.parse(message),
    };
    connections[sessionId] = ws;
    pub.publish("user-registration", JSON.stringify(sessionMessage));
  });
});
