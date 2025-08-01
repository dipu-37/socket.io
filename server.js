const express = require("express");
const socket = require("socket.io");
const app = express();

const http = require("http");
const expressHTTPServer = http.createServer(app);
const io = new socket.Server(expressHTTPServer);

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

io.on("connect", (socket) => {
  console.log("New user connected");

  io.to(socket.id).emit("getName");

  socket.on("new-message", (msg, cb) => {
    console.log(msg);
    socket.broadcast.emit("receive-msg", msg);
    cb();
  });

  socket.on("setName", (name) => {
    console.log(name);
  });
});

expressHTTPServer.listen(3000, () => {
  console.log(`server is running on port ${3000}`);
});

// room create - google meet
// obj or function pass
//
