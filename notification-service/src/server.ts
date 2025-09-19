import express, { Express } from "express";
import { Server } from 'http';
import { errorConverter, errorHandler } from "./middleware";
import config from "./config/config";
import { RabbitMQService } from "./services";

const app: Express = express();
let server: Server;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorConverter);
app.use(errorHandler);

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
