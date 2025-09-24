import client from 'prom-client';

client.collectDefaultMetrics();

export const register = client.register;

export const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
});