import { Server } from "socket.io";

const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST", "DELETE", "PUT"],
        },
    });

    console.log("Socket.IO is running...");

    io.on("connection", (socket) => {
        console.log(`A user connected: ${socket.id}`);

        socket.on("message-backend", ({ message }) => {
            console.log("Message received:", message);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected.");
        });
    });
};

export { connectToSocket };
