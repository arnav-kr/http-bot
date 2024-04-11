const { ApplicationCommandOptionType } = require("discord-api-types/v10");

module.exports = [
  {
    name: 'deploy',
    description: 'Deploy Slash Commands',
    category: 'ownerOnly',
    options: [
      {
        name: 'commands',
        description: 'Commands to deploy (separated by space)',
        type: ApplicationCommandOptionType.String,
        required: true,
        autocomplete: true,
      },
    ]
  },
  {
    name: "help",
    description: "Show list of all the commands",
    category: "Utility",
    options: [
      {
        name: "command",
        description: "Show help for specific command",
        type: ApplicationCommandOptionType.String,
        required: false,
        autocomplete: true,
      },
    ],
  },
  {
    name: "invite",
    category: "Support",
    description: "Invite Me to Your Server!",
  },
  {
    name: "ping",
    category: "Utility",
    description: "Ping Me!",
  },
];