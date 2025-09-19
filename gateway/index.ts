import express, { Express } from 'express';
import proxy from 'express-http-proxy';

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const auth = proxy("http://localhost:8081");
const messages = proxy("http://localhost:8082");
const notifications = proxy("http://localhost:8083");

app.use('/api/auth', auth);
app.use('/api/messages', messages);
app.use('/api/notifications', notifications);

app.get('/health', async (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    })
});

const server = app.listen(8080, () => {
    console.log("Gateway is Listening to Port 8080");
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

const unhandledExceptionHandler = (error: unknown) => {
    console.error(error);
    exitHandler();
}

process.on("uncaughtException", unhandledExceptionHandler);
process.on("unhandledRejection", unhandledExceptionHandler);
