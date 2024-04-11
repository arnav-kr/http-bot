const {
  InteractionResponseType,
  MessageComponentTypes,
  ButtonStyleTypes,
} = require("discord-interactions");

const command = {
  name: "invite",
  description: "Invite Me to Your Server!",
  category: "Support",

  run({ interaction }) {
    interaction.respond({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Invite me to your server!`,
        components: [{
          type: MessageComponentTypes.ACTION_ROW,
          components: [{
            type: MessageComponentTypes.BUTTON,
            label: "Invite",
            style: ButtonStyleTypes.LINK,
            url: interaction.client.config.inviteURL,
          },
            // {
            //   type: "BUTTON",
            //   label: "Website",
            //   style: "LINK",
            //   url: msg.client.config.website,
            // }
          ],
        }],
      }
    })
  }
}

module.exports.command = command;
