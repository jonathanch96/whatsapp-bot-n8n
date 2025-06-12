# WhatsApp Bot N8N

A WhatsApp bot that integrates with N8N for automated workflows and messaging.

## Prerequisites

- Docker and Docker Compose installed
- N8N instance running (for webhook integration)

## Setup Instructions

### 1. Create External Network

First, create the shared network that the bot will use:

```bash
docker network create shared_network
```

### 2. Environment Configuration

Create a `.env` file in the project root and set the required environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file and set your N8N webhook URL:

```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/whatsapp
SESSION_PATH=/app/sessions
```

Replace `https://your-n8n-instance.com/webhook/whatsapp` with your actual N8N webhook URL.

### 3. Start the Application

Run the WhatsApp bot using Docker Compose:

```bash
docker compose up -d
```

This will:
- Build the Docker image if it doesn't exist
- Start the container in detached mode
- Mount the sessions directory for persistent WhatsApp sessions
- Expose the application on port 3123

### 4. Access and Setup

1. Open your browser and navigate to:
   ```
   http://localhost:3123/
   ```

2. You will see a QR code on the page

3. Open WhatsApp on your phone and scan the QR code:
   - Go to **Settings** > **Linked Devices** > **Link a Device**
   - Scan the QR code displayed in your browser

4. Once connected, your WhatsApp bot will be ready to receive and send messages through N8N webhooks

## Usage

- The bot will automatically connect to your N8N instance using the webhook URL
- Messages received by the bot will be forwarded to your N8N workflow
- You can send messages programmatically through N8N workflows
- Sessions are persisted in the `./sessions` directory

## Troubleshooting

### Container Issues
```bash
# Check container logs
docker compose logs whatsapp-bot

# Restart the container
docker compose restart whatsapp-bot
```

### Network Issues
```bash
# Verify the network exists
docker network ls | grep shared_network

# If network doesn't exist, create it
docker network create shared_network
```

### QR Code Issues
- If the QR code doesn't appear, wait a few moments for the container to fully start
- Refresh the browser page
- Check the container logs for any errors

## Stopping the Application

To stop the WhatsApp bot:

```bash
docker compose down
```

To stop and remove all data:

```bash
docker compose down -v
```

## Project Structure

```
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile           # Docker image definition
├── .env                # Environment variables
├── sessions/           # WhatsApp session data (auto-created)
└── README.md           # This file
``` 