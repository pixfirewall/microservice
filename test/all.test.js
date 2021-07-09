const WebSocket = require("ws");
const Chance = require("chance");

const chance = new Chance();
const socketAddress = "ws://localhost:8080";

const name = chance.string({ length: 10, alpha: true });

describe("checking the behavior of the app", () => {
  describe("validations", () => {
    test("invalid email test", (done) => {
      const msg = {
        type: "registration",
        username: name,
        password: "P@ssw0rd",
        email: name,
      };

      const ws = new WebSocket(socketAddress);
      ws.on("open", () => {
        ws.send(JSON.stringify(msg));
      });

      ws.on("message", (msg) => {
        ws.close();
        try {
          response = JSON.parse(msg);
          expect(response.message).toEqual("Invalid Email!");
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    test("invalid password test", (done) => {
      const msg = {
        type: "registration",
        username: name,
        password: name,
        email: `${name}@test.com`,
      };

      const ws = new WebSocket(socketAddress);
      ws.on("open", () => {
        ws.send(JSON.stringify(msg));
      });

      ws.on("message", (msg) => {
        ws.close();
        try {
          response = JSON.parse(msg);
          expect(response.message).toEqual(
            "Password should be in complex mode!"
          );
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe("new user registeration", () => {
    test("registeration successful", (done) => {
      const msg = {
        type: "registration",
        username: name,
        password: "P@ssw0rd",
        email: `${name}@test.com`,
      };

      const ws = new WebSocket(socketAddress);
      ws.on("open", () => {
        ws.send(JSON.stringify(msg));
      });

      ws.on("message", (msg) => {
        ws.close();
        try {
          response = JSON.parse(msg);
          expect(response.message).toEqual(
            "Your account has been created successfully"
          );
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    test("register duplicate user", (done) => {
      const msg = {
        type: "registration",
        username: name,
        password: "P@ssw0rd",
        email: `${name}@test.com`,
      };

      const ws = new WebSocket(socketAddress);
      ws.on("open", () => {
        ws.send(JSON.stringify(msg));
      });

      ws.on("message", (msg) => {
        ws.close();
        try {
          response = JSON.parse(msg);
          expect(response.message).toEqual("User is already registered.");
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
