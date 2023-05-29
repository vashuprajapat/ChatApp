var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/name.html");
});
users = [];
io.on("connection", function (socket) {
  console.log("A user connected");
  var userName;
  socket.on("setUsername", function (data) {
    if (users.indexOf(data) > -1) {
      socket.emit(
        "userExists",
        data + " username is taken! Try some other username."
      );
    } else {
      userName = data;
      users.push(data);
      socket.emit("userSet", { username: data, userList: users });
      io.sockets.emit("newmsg", {
        message: `${data} joined to the chat room`,
        user: "Chat Bot",
        userList: users,
        count: 0,
        date: `${new Date().getHours()}:${new Date().getMinutes()}`,
      });
    }
  });
  socket.on("msg", function (data) {
    // data.userList = users;
    //Send message to everyone
    if (data.count === 0) {
      io.sockets.emit("newmsg", data);
    }
  });
  socket.on("pm", function (data) {
    // console.log("recived recipnt name is " + data.recipient);
    // data.userList = users;
    //Send message to everyone
    io.sockets.emit("pnewmsg", data);
  });
  socket.on("disconnect", () => {
    // console.log(userName);
    users = users.filter((item) => item !== userName);
    io.sockets.emit("newmsg", {
      message: `${userName} leave the chat room`,
      user: "Chat Bot",
      count: 0,
      userList: users,
      date: `${new Date().getHours()}:${new Date().getMinutes()}`,
    });
    console.log("user disconnected");
  });
});

http.listen(3000, function () {
  console.log("listening on localhost:3000");
});
