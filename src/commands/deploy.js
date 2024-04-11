const command = {
  name: 'deploy',
  category: 'ownerOnly',
  description: 'Deploy Slash Commands',
  userPerms: ['ADMINISTRATOR'],
  options: [
    {
      name: 'commands',
      description: 'Commands to deploy (separated by space)',
      type: 'STRING',
      required: true,
      autocomplete: true,
    },
  ],

  async run({ interaction }) {

    let isDM = interaction.channel.type === 'DM';

    await interaction.reply({
      content: `${interaction.client.getEmoji("sit_loading")} Working On It...`,
    });
    let args = interaction.options.getString('commands').split(' ');
    if (!args.length) {
      return interaction.editReply({
        content: "‍",
        embeds: [{
          color: 0x7289DA,
          title: 'Avaliable Slash Commands',
          description: interaction.client.slashCommands.map(c => {
            return `**${c.name}** : ${c.description}`
          }).join('\n'),
          timestamp: new Date()
        }]
      })
    }

    if (isDM && (args[0].toLowerCase() !== "global")) {
      return interaction.editReply({
        content: "You can't deploy commands in DM.",
      });
    }

    if ((args[0].toLowerCase() == "global") && (interaction.client.config.owners.includes(interaction.user.id))) {
      if (await interaction.client.registerSlashCommand({ commands: interaction.client.slashCommands.map(c => c) })) interaction.editReply({ content: "Deploying all commands globally. it may take a while.", embeds: [] });
      else interaction.editReply({ content: 'Failed to deploy global commands.', embeds: [] });
    }
    else {
      args = args.map(e => e.toLowerCase());
      const commands = [];
      if (args[0] == "*" || args[0].toLowerCase() == "all") {
        interaction.client.slashCommands.forEach(c => {
          commands.push(c);
        });
      }
      else {
        interaction.client.slashCommands.forEach(c => {
          if (args.includes(c.name.toLowerCase())) {
            commands.push(c)
          }
        })
      }

      interaction.client.registerSlashCommand({
        guildId: interaction.guild.id,
        commands
      }).then(b => {
        if (b && commands.length)
          interaction.editReply({ content: 'Successfully registered SlashCommand(s).', embeds: [] });
        else if (b) interaction.editReply({ content: 'Successfully removed all slash commands.', embeds: [] });
        else interaction.editReply({ conetnt: 'Failed to deploy SlashCommands.', embeds: [] });
      })
    }
  },
  autocompleteRun({ interaction }) {
    let commands = ["all", "global"];
    if (interaction.channel.type === 'DM') {
      commands = ["global"];
      return interaction.respond([
        {
          name: 'global',
          value: 'global',
          description: 'Deploy global commands',
        }
      ]);
    }
    interaction.client.slashCommands.forEach(c => {
      commands.push(c.name);
    });
    let suggestions = [];
    commands.forEach(c => {
      suggestions.push({
        name: c,
        value: c,
        description: `Deploy ${c}`,
      });
    });
    interaction.respond(suggestions);
  }
}

module.exports.command = command;