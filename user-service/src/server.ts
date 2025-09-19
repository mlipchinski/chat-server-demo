import express, { Express } from 'express';
import { Server } from 'http';
import { userRoutes } from './routes/authRoutes';
import { errorConverter, errorHandler } from './middleware';
import { connectDB } from './database';
import config from './config/config';
import { RabbitMQService } from './services/RabbitMQService';

const app: Express = express();
let server: Server;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(userRoutes);
app.use(errorConverter);
app.use(errorHandler);

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

const initRabbitMQService = async () => {
    try {
        let rabbitMQService = new RabbitMQService();
        console.log("RabbitMQ client initialized and listening for messages.");
    } catch (error) {
        console.error("Failed to initialize RabbitMQ client:", error);
    }
};

initRabbitMQService();

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

const unhandledExceptionHandler = (error: unknown) => {
    console.error(error);
    exitHandler();
}

process.on("uncaughtException", unhandledExceptionHandler);
process.on("unhandledRejection", unhandledExceptionHandler);
