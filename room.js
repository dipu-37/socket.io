const express = require("express");
const socket = require("socket.io");
const app = express();
app.use(express.static("public"));

const http = require("http");
const expressHTTPServer = http.createServer(app);
const io = new socket.Server(expressHTTPServer);

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/room.html`);
});

io.on("connection", (socket) => {
  console.log("Connected");

  // get online users
  const getOnlineUsers = async () => {
    const activeUserSockets = io.sockets.sockets;
    const sids = io.sockets.adapter.sids;
    const activeUserArray = [...sids.keys()];
    const activeUser = [];
    activeUserArray.forEach((userId) => {
      const userSocket = activeUserSockets.get(userId);
      if (userSocket.name) {
        activeUser.push({
          id: userSocket.id,
          name: userSocket.name,
        });
      }
    });
    return activeUser;
  };

  // get rooms
  const getPublicRoom = async () => {
    const rooms =await io.sockets.adapter.rooms;
    const sids =await io.sockets.adapter.sids;
    const roomKeys =[... rooms.keys()];
    const sidKeys = [...sids.keys()];

    const publicRoomIds = [];
    for(let roomId of roomKeys){
      if(!sidKeys.includes(roomId)){
         publicRoomIds.push(roomId);
      }
    }
    
  };

  // set name event
  socket.on("setName", async (name, cb) => {
    socket.name = name;
    cb();
    const activeUsers = await getOnlineUsers();
    io.emit("get_active_users", activeUsers);
    await getPublicRoom();
  });

  // disconnect event
  socket.on("disconnect", async () => {
    const activeUser = await getOnlineUsers();
    io.emit("get_active_users", activeUser);
  });

  //send a private message
  socket.on("send_a_msg", (data, cb) => {
    const id = data.id;
    const msg = data.msg;
    io.to(id).emit("receive_a_message", data, socket.id);
    cb();
  });

  // create a public room
  socket.on("create_room", async (roomName, cb) => {
    socket.join(roomName);
    await getPublicRoom();
  });



});

expressHTTPServer.listen(3000, () => {
  console.log("Server is running on port @3000");
});
