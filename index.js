import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const VESTABOARD_TOKEN = process.env.VESTABOARD_TOKEN;
const COOLDOWN_MS = 60_000; // 1 minute per user

if (!DISCORD_TOKEN || !CLIENT_ID || !VESTABOARD_TOKEN) {
  console.error(
    "Missing required env vars: DISCORD_TOKEN, DISCORD_CLIENT_ID, VESTABOARD_TOKEN"
  );
  process.exit(1);
}

// Register /vesta slash command
const command = new SlashCommandBuilder()
  .setName("vesta")
  .setDescription("Post a message to the Vestaboard")
  .addStringOption((opt) =>
    opt
      .setName("message")
      .setDescription("The text to display on the Vestaboard")
      .setRequired(true)
      .setMaxLength(200)
  );

const rest = new REST().setToken(DISCORD_TOKEN);
await rest.put(Routes.applicationCommands(CLIENT_ID), {
  body: [command.toJSON()],
});
console.log("Slash command /vesta registered.");

// Per-user cooldown map: userId -> timestamp of last post
const cooldowns = new Map();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== "vesta")
    return;

  const userId = interaction.user.id;
  const now = Date.now();
  const lastUsed = cooldowns.get(userId) ?? 0;
  const remaining = COOLDOWN_MS - (now - lastUsed);

  if (remaining > 0) {
    const secs = Math.ceil(remaining / 1000);
    await interaction.reply({
      content: `You can post again in **${secs}s**.`,
      ephemeral: true,
    });
    return;
  }

  const text = `${interaction.user.tag}: ${interaction.options.getString("message", true)}`;

  // Defer so we have time for the API call
  await interaction.deferReply();

  try {
    const res = await fetch("https://cloud.vestaboard.com/", {
      method: "POST",
      headers: {
        "X-Vestaboard-Token": VESTABOARD_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Vestaboard API error ${res.status}: ${body}`);
      await interaction.editReply(
        `Failed to post to Vestaboard (HTTP ${res.status}). Try again later.`
      );
      return;
    }

    cooldowns.set(userId, now);
    console.log(`[${interaction.guild.name}] ${text}`);
    await interaction.editReply(
      `Posted to the Vestaboard: **${text}**`
    );
  } catch (err) {
    console.error("Network error posting to Vestaboard:", err);
    await interaction.editReply(
      "Could not reach the Vestaboard API. Check your connection and try again."
    );
  }
});

client.once("clientReady", () => console.log(`Logged in as ${client.user.tag}`));
client.login(DISCORD_TOKEN);
