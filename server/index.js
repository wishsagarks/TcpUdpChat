const express = require("express")
const app = express()
const cors = require("cors")
const http = require('http').Server(app);
const path = require('path')
const PORT = process.env.PORT || 4000 ;
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});
const __dirname1=path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/client/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

app.use(cors())

let users = []

socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`)  
    socket.on("message", data => {
      socketIO.emit("messageResponse", data)
    })

    socket.on("typing", data => (
      socket.broadcast.emit("typingResponse", data)
    ))

    socket.on("newUser", data => {
      users.push(data)
      socketIO.emit("newUserResponse", users)
    })
 
    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
      users = users.filter(user => user.socketID !== socket.id)
      socketIO.emit("newUserResponse", users)
      socket.disconnect()
    });
});

app.get("/api", (req, res) => {
  res.json({message: "Hello"})
});

   
http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});