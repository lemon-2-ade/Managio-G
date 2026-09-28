import { Server } from "socket.io";
import { resolveUserFromToken } from "./middleware/authMiddleware.js";

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.use(async (socket, next) => {
    try {
      const user = await resolveUserFromToken(socket.handshake.auth?.token);
      if (!user) {
        return next(new Error("Not authenticated"));
      }
      socket.userId = String(user._id);
      next();
    } catch (error) {
      next(new Error("Not authenticated"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(socket.userId);
  });

  return io;
}

export function getIO() {
  return io;
}
