import "dotenv/config";

const {
    NODE_ENV,
    PORT,

    RABBITMQ_HOST,
    RABBITMQ_PORT,
    RABBITMQ_DEFAULT_USER,
    RABBITMQ_DEFAULT_PASS,
    RABBITMQ_VHOST,

    SMTP_HOST,
    SMTP_PORT = 587

} = process.env;

// Build RabbitMQ URL
const MESSAGE_BROKER_URL = `amqp://${RABBITMQ_DEFAULT_USER}:${RABBITMQ_DEFAULT_PASS}@${RABBITMQ_HOST}:${RABBITMQ_PORT}${RABBITMQ_VHOST}`;

export default {
    env: NODE_ENV,
    PORT,
    msgBrokerUrl: MESSAGE_BROKER_URL,
    SMTP_HOST,
    SMTP_PORT,
};
