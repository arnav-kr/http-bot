const {
  InteractionResponseType
} = require("discord-interactions");
const edit = require("../utils/editResponse");

const command = {
  name: "ping",
  description: "Ping Me!",
  category: "Utility",

  async run({ interaction }) {
    let reqTimestamp = interaction.timestamp;
    interaction.respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `${interaction.client.getEmoji("sit_bouncing_cat")} Pong!`,
      }
    });
    try {
      console.log("Ping: ", Date.now() - reqTimestamp * 1000);
      await interaction.edit({
        content: `${interaction.client.getEmoji("sit_bouncing_cat")} Pong! **Latency:** ${Date.now() - reqTimestamp * 1000}ms`
      });
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports.command = command;
