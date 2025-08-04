const socket = io();

// selections
const nameForm = document.getElementById("name_form");
const nameFormArea = document.querySelector(".name");
const roomArea = document.querySelector(".room");
const OnlineUserList = document.getElementById("onlineUserList");
const innerCanvas = document.querySelector(".inner_canvas");
innerCanvas.hidden = true;
const displayName = document.querySelector(".displayName");
const msgForm = document.getElementById("msg_form");
const messages = document.querySelector(".messages");
const roomCreateBtn = document.getElementById('create-btn');
const roomNameInputEl = document.getElementById('create_room');

// global variable
let activeUser;

//set name
nameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameForm[0].value;
  if (!name) return;
  socket.emit("setName", name, () => {
    nameFormArea.hidden = true;
    roomArea.hidden = false;
  });

  // get active users
  socket.on("get_active_users", (users) => {
    activeUser = users;
    OnlineUserList.innerHTML = "";
    activeUser.forEach((user) => {
      const li = document.createElement("li");
      li.style.cursor = "pointer";
      li.addEventListener("click", () => {
        openCanvas(user);
        messages.innerHTML=""
      });
      li.textContent = user.id == socket.id ? "You" : user.name;
      li.dataset.id = user.id;
      li.classList.add("list-group-item");
      li.classList.add("onLine");
      OnlineUserList.appendChild(li);
    });
  });

  //send private msg
  msgForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = msgForm[0].value;
    const id = msgForm[1].value;

    if (msg) {
      socket.emit("send_a_msg", { msg, id }, () => {
        console.log("send msg");
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.textContent = "You" + ": " + msg;

        messages.appendChild(li);
        msgForm[0].value = "";
      });
    }
  });

  //receive an event
  socket.on("receive_a_message", (data, senderId) => {
    const user = activeUser.find((u) => u.id == data.id);
    openCanvas(user);

    const sender = activeUser.find((u) => u.id == senderId);
    openCanvas(sender);

    const li = document.createElement("li");
    li.classList.add("list-group-item");
    li.textContent = sender.name + ": " + data.msg;

    messages.appendChild(li);
  });

  // open the msg canvas
  function openCanvas(user) {
    innerCanvas.hidden = false;
    displayName.textContent = user.name;
    msgForm[1].value = user.id;
  }

  // create room functionality
  roomCreateBtn.addEventListener('click',(e)=>{
    const roomName = roomNameInputEl.value;
    if(roomName){
      socket.emit("create_room",roomName,()=>{
        console.log("Created")
      })
    }
  })



});
