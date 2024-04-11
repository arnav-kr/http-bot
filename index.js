
require("dotenv").config();
const path = require("path");
const { readdirSync } = require("fs");

const express = require("express");
const app = express();

const Client = require("./src/client.js");
const editResponse = require("./src/utils/editResponse");

const {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} = require("discord-interactions");

const register = require("./src/utils/register.js");
const { Config } = require("./botconfig.js");
const { EventEmitter } = require("events");

// Express Middlewares
app.use(express.json());
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.append("Access-Control-Allow-Headers", "Content-Type,x-signature-ed25519,x-signature-timestamp");
  next();
});

// Verify the request is from Discord
app.use(async (req, res, next) => {
  if (req.method === "POST") {
    // Using the incoming headers, verify this request actually came from discord.
    const signature = req.headers["x-signature-ed25519"];
    const timestamp = req.headers["x-signature-timestamp"];
    // console.log(signature, timestamp, process.env.DISCORD_PUBLIC_KEY);
    const body = await req.body;
    const isValidRequest = verifyKey(
      Buffer.from(JSON.stringify(body), "utf-8"),
      signature,
      timestamp,
      process.env.DISCORD_PUBLIC_KEY
    );
    if (!isValidRequest) {
      console.error("Invalid Request");
      return res.status(401).end("Bad request signature.");
    } next();
  }
  else next();
});

// Commands
const commands = new Map();
const commandsPath = path.join(__dirname, "src/commands");
const commandFiles = readdirSync(commandsPath).filter(f => f.endsWith(".ts") || f.endsWith(".js"));
commandFiles.forEach(async filePath => {
  const command = require(`${commandsPath}/${filePath}`).command;
  commands.set(command.name, command);
});

// Client
let client = new Client({
  commands,
  config: Config,
});
client.metadata = {
  IV: process.env.AES_IV,
  SA: process.env.AES_SALT
}

// Global Component Interaction Collector
const collector = new EventEmitter({
  captureRejections: true,
});

// Routes
app.get("/", (req, res) => {
  return res.end(`Hi from ${process.env.DISCORD_APPLICATION_ID}`);
});

// Slash Commands Regstration Route
app.get("/register/:guildId", async (req, res) => {
  if (req.params.guildId !== "global") {
    try {
      let resp = await register(req.params.guildId);
      console.log(resp);
      return res.status(200).end("Done")
    }
    catch (e) {
      console.log(e);
      return res.status(500).end("An Error Occured!")
    }
  }
  else {
    try {
      let resp = await register();
      console.log(resp);
      return res.status(200).end("Done")
    }
    catch (e) {
      console.log(e);
      return res.status(500).end("An Error Occured!")
    }
  }
})


// Interaction Route
app.post("/interactions", async (req, res) => {
  const interaction = await req.body;
  let signature = req.headers["x-signature-ed25519"];
  let timestamp = req.headers["x-signature-timestamp"];
  interaction.signature = signature;
  interaction.timestamp = timestamp;
  interaction.client = client;
  interaction.collector = collector;
  interaction.respond = (data) => {
    return res.status(200).json(data);
  }
  interaction.edit = (data) => {
    return editResponse({ interaction, body: data });
  }
  if (interaction?.member?.user) {
    interaction.member.user.getAvatarURL = () => {
      return `https://cdn.discordapp.com/avatars/${interaction.member.user.id}/${interaction.member.user.avatar}.png`;
    }
  }

  // Handle Ping
  if (interaction.type === InteractionType.PING) {
    console.log("Handling Ping request");
    console.log("data: ", interaction.data);
    return res.json({ type: InteractionResponseType.PONG });
  }

  // Handle Message Component
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    console.log("Handling Message Component request");
    console.log("Data: ", interaction.data);
    return collector.emit("collect", { interaction });
  }

  // Handle Autocomplete
  if (interaction.type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE) {
    console.log("Handling Autocomplete request");
    console.log("Data: ", interaction.data);
    let command = client.commands.get(interaction.data.name.toLowerCase());
    if (!command) {
      console.log("Command Not Found!");
      return res.status(404).json({ error: "Command Not Found!" });
    }
    // pause autocomplete
    // return await command.autocompleteRun({ interaction });
  }

  // Handle Slash Command
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    console.log("Handling Command request");
    console.log("Data: ", interaction.data)
    let command = client.commands.get(interaction.data.name.toLowerCase());
    if (!command) {
      console.log("Command Not Found!");
      return res.status(404).json({ error: "Command Not Found!" });
    }
    return await command.run({ interaction });
  }

  // Fall Back
  return res.status(400).json({ error: "Unknown Type" });
});

// Genral Path Handler
app.all("*", (req, res) => res.status(404).end("Not Found."));

// Start Server
app.listen(3000, () => console.log("Server started on port 3000"));