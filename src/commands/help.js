const MessageEmbedsPagination = require("../utils/embedsPagination");
const {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} = require("discord-interactions");

let commandStructure = {}
let commandEmbeds = [];
let commandsCategory = [];

const command = {
  name: "help",
  description: "Show list of all the commands",
  category: "Utility",
  options: [
    {
      name: "command",
      description: "Show help for specific command",
      type: 'STRING',
      required: false,
      autocomplete: true,
    },
  ],

  async run({ interaction }) {
    let arg = interaction.data?.options?.filter(i => i.name == "command")[0]?.value || null;
    interaction.respond({
      type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `${interaction.client.getEmoji("sit_loading")} Fetching Commands...`,
      }
    });
    if (arg) {
      let cmd;
      try {
        cmd = interaction.client.commands.get(arg);
      }
      catch (e) {
        console.log(e);
        return interaction.respond({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Please Enter a Valid command Name!",
            ephemeral: true,
          }
        });
        return;
      }
      if (!cmd) {
        return interaction.respond({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Please Enter a Valid command Name!",
            ephemeral: true,
          }
        });
      }
      return interaction.respond({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [getSingleCommandEmbed(cmd, interaction.client)],
        }
      });
    }
    Object.keys(commandStructure).length === 0 ? commandStructure = getStructureCommandData(interaction.client) : true;
    commandEmbeds.length == 0 ? commandEmbeds = getCommandsEmbed(commandStructure, interaction.client) : true;
    commandsCategory.length == 0 ? commandsCategory = getCommandsCategory(commandStructure) : true;

    // console.log("Here");
    await MessageEmbedsPagination({ interaction, embeds: commandEmbeds, pageNames: commandsCategory });
  },

  autocompleteRun({ interaction }) {
    let commands = [];
    client.commands.forEach(c => {
      commands.push(c.name);
    });
    let suggestions = [];
    commands.forEach(c => {
      suggestions.push({
        name: c,
        value: c,
        // description: `Help for ${c}`,
      });
    });
    interaction.respond({
      type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
      data: {
        choices: suggestions,
      },
    });
  }
}

/**
 * Give all the command in structured format
 * @param: ExtendedClient
 * @return structuredData - { ...category: [...commandsName] }
 */
function getStructureCommandData(client) {
  const commands = client.commands;
  const structuredData = {};

  commands.forEach((commandData) => {
    const { category, name } = commandData;
    if (category && category == "ownerOnly") return;
    if (category) {
      structuredData[category] ? structuredData[category].push(name) : structuredData[category] = [name];
    }
  });
  return structuredData;
}

/**
 * Give all the command in structured format
 * @param: Structured Data of command
 * @param: ExtendedClient
 * @return: MessageEmbed
 */
function getSingleCommandEmbed(command, client) {
  const { category, name, description, usage, aliases, guildOnly, devOnly, userPerms, proTip } = command;
  const embed = {
    color: 0x7289DA,
    title: `/${name}`,
    description: description || "No description available",
    fields: [
      {
        name: "Usage",
        value: usage || "No usage available",
        inline: true,
      },
      {
        name: "Category",
        value: category || "None",
        inline: true,
      },
      {
        name: "Guild Only",
        value: guildOnly ? "Yes" : "No",
        inline: true,
      },
      // {
      //   name: "Owner Only",
      //   value: devOnly ? "Yes" : "No",
      //   inline: true,
      // },
      {
        name: "Permissions",
        value: userPerms?.length ? userPerms.join(", ") : "None",
        inline: true,
      },
    ],
    timestamp: new Date(),
  };
  if (proTip) embed.fields.push({ name: "Pro Tip", value: proTip });
  return embed;
}



/**
 * Give all the command in structured format
 * @param: Structured Data of command
 * @param: ExtendedClient
 * @return: array of MessageEmbed
 */
function getCommandsEmbed(structuredData, client) {
  const commandEmbeds = [];
  for (const category in structuredData) {

    let description = ``;

    structuredData[category].forEach(function (command) {
      const cmd = client.commands.get(command);
      description += `**${command}**: ${cmd?.description}\n`;
    });

    const tempEmbed = {
      color: 0x7289DA,
      title: `Help for **${category.replace(/\b\w/g, l => l.toUpperCase())}**`,
      // author: { name: client.config.name, iconURL: client.config.icon, url: client.config.url },
      description: description,
      timestamp: new Date(),
      // footer: { text: client.config.name, iconURL: client.config.icon },
    };
    commandEmbeds.push(tempEmbed);
    // console.log(client.config.name)
  }

  return commandEmbeds;
}

function getCommandsCategory(commandStructure) {
  const commandsCategory = [];
  for (let category in commandStructure) {
    commandsCategory.push(category)
  }
  return commandsCategory;
}

module.exports.command = command;