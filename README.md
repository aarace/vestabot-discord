# Vestabot (Discord)

A Discord bot that lets anyone in your server post messages to a Vestaboard using the `/vesta` slash command. Each user is limited to one post per minute.

## Prerequisites

- [Node.js](https://nodejs.org/) v22+
- A [Discord application and bot token](https://discord.com/developers/applications)
- A Vestaboard Read/Write API token (Vestaboard app → Settings → Developer)

## Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone <your-repo-url>
   cd vestabot-discord
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   | Variable | Where to find it |
   |---|---|
   | `DISCORD_TOKEN` | Discord Developer Portal → your app → Bot → Token |
   | `DISCORD_CLIENT_ID` | Discord Developer Portal → your app → General Information → Application ID |
   | `VESTABOARD_TOKEN` | Vestaboard app → Settings → Developer → Read/Write API token |

3. Invite the bot to your server:
   - Go to your app in the Discord Developer Portal
   - Navigate to **OAuth2 → URL Generator**
   - Select scopes: `bot` and `applications.commands`
   - Select bot permission: **Send Messages**
   - Open the generated URL and authorize the bot to your server

## Running in a console (for testing)

```bash
node index.js
```

You should see:
```
Slash command /vesta registered.
Logged in as YourBot#1234
```

Use `/vesta <message>` in any channel to post to the Vestaboard.

## Running in Docker

**Build the image:**
```bash
docker build -t vestabot-discord .
```

**Start the container** (runs in the background, restarts automatically):
```bash
docker run -d --restart unless-stopped --env-file .env --name vestabot-discord vestabot-discord
```

**Rebuild after code changes:**
```bash
docker build -t vestabot-discord . && docker rm -f vestabot-discord && docker run -d --restart unless-stopped --env-file .env --name vestabot-discord vestabot-discord
```

**Other useful commands:**
```bash
docker logs vestabot-discord       # view logs / errors
docker restart vestabot-discord    # restart the container
docker stop vestabot-discord       # stop the container
```
