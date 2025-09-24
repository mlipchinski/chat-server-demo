# Chat Server Microservices

This repository contains a **fully Dockerized microservices-based chat server**.  
It is designed with scalability, observability, and continuous integration in mind.

## Features

- **Microservice Architecture**  
  Each core functionality (auth, messages, notifications, etc.) is isolated into its own service for flexibility and easier scaling.

- **Full Dockerization**  
  All services run inside Docker containers for consistent, reproducible deployments.  
  Comes with a `docker-compose.yml` for simple local setup.

- **Observability with Prometheus & Grafana**  
  Metrics are collected via Prometheus and visualized in Grafana dashboards — ready to use out of the box.

- **Continuous Integration**  
  GitHub Actions workflow (`.github/workflows/ci.yml`) handles build and test pipelines.

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

### Run Locally
Clone the repo and start all services with:
```bash
git clone https://github.com/mlipchinski/chat-server-miscroservices.git
cd chat-server-miscroservices
docker-compose up --build
