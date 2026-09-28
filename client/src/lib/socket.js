import { io } from "socket.io-client";
import { auth } from "../firebase";

export async function connectSocket() {
  const token = await auth.currentUser?.getIdToken();

  return io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
    auth: { token },
  });
}
