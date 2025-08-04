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
    const rooms = await io.sockets.adapter.rooms; // (রুম আইডি → কে কে আছে)
    const sids = await io.sockets.adapter.sids; // self-rooms মানে socket ID গুলো নিজেই নিজে রুম
    const allSockets = await io.sockets.sockets; //সব connected socket/user info

    const roomKeys = [...rooms.keys()];
    const sidKeys = [...sids.keys()];

    const publicRooms = []; //roomName
    let roomId = 0;
    for (let roomName of roomKeys) {
      // public room
      if (!sidKeys.includes(roomName)) {
        const participantSet = rooms.get(roomName); //ঐ রুমে কে কে আছে (Set of socketId)
        const size = participantSet.size;

        const participants = [];
        for (let id of [...participantSet]) {
          const userSocket = allSockets.get(id); //socket ID দিয়ে ইউজার/ক্লায়েন্টের info পাওয়া যাচ্ছে
          participants.push({
            id: userSocket.id,
            name: userSocket.name,
          });
        }

        publicRooms.push({
          id: "a" + roomId + Date.now(),
          roomName,
          size,
          participants
        });
        ++roomId;
      }
    }
    return publicRooms;
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
    const publicRooms = await getPublicRoom();
    console.log(publicRooms);
    io.emit('getPublicRooms',publicRooms)

  });
});

expressHTTPServer.listen(3000, () => {
  console.log("Server is running on port @3000");
});
