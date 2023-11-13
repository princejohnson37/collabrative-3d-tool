import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected at ${new Date()}`);
  socket.on("message", (data) => {
    console.log(data);
    // io.emit("message", `${socket.id.substring(0, 5)}:${data}`);
    io.emit("message", data);
  });
});

httpServer.listen(3500, () => {
  console.log("listing on port 3500");
});
