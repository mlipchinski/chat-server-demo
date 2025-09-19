import { Server as HttpServer } from 'http';
import { connectDB, Message } from './database';
import { app } from './app';
import config from './config/config';
import { Socket, Server as SocketIOServer } from 'socket.io';

let server: HttpServer;
connectDB();

app.get('/health', async (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    })
});

server = app.listen(config.PORT, () => {
    console.log(`Server running at port: ${config.PORT}`);
});

const io = new SocketIOServer(server);
io.on("connection", (socket: Socket) => {
    console.log("Client connected");
    socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
    });

    socket.on("sendMessage", (message) => {
        io.emit("receiveMessage", message);
    });

    socket.on("sendMessage", async (data) => {
        const { senderId, receiverId, message } = data;
        const msg = new Message({ senderId, receiverId, message });
        await msg.save();

        io.to(receiverId).emit("receiveMessage", msg); // Assuming receiverId is socket ID of the receiver
    });
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
            console.info("Server closed");
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error: unknown) => {
    console.error(error);
    exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);