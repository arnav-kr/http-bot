// const { MessageActionRow, MessageButton, MessageSelectMenu, Message, CommandInteraction } = require("discord.js");
/**
 * A Embeds Pagination For message
 * @param: message object
 * @param: array of embeds
 * @param: an array of string with pageNames
 * @param: TimeLimit in ms [Default 120000]
 */

const {
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  ButtonStyleTypes,
} = require("discord-interactions");

const MessageEmbedsPagination = async ({ interaction, embeds, pageNames, ephemeral = false, time = 120000, deferred = false } = {}) => {
  console.log("interaction");
  let sent = null;
  const navigation = {
    type: MessageComponentTypes.ACTION_ROW,
    components: [
      {
        type: MessageComponentTypes.BUTTON,
        custom_id: "first",
        emoji: { name: "⏪" },
        style: ButtonStyleTypes.PRIMARY,
      },
      {
        type: MessageComponentTypes.BUTTON,
        custom_id: "previous",
        emoji: { name: "◀️" },
        style: ButtonStyleTypes.PRIMARY,
      },
      {
        type: MessageComponentTypes.BUTTON,
        custom_id: "next",
        emoji: { name: "▶️" },
        style: ButtonStyleTypes.PRIMARY,
      },
      {
        type: MessageComponentTypes.BUTTON,
        custom_id: "last",
        emoji: { name: "⏩" },
        style: ButtonStyleTypes.PRIMARY,
      },
      {
        type: MessageComponentTypes.BUTTON,
        custom_id: "stop",
        emoji: { name: "⏹️" },
        style: ButtonStyleTypes.DANGER,
      },
    ]
  }

  // Make selection if Showmenu is true

  let selction = {
    type: MessageComponentTypes.STRING_SELECT,
    custom_id: "selection",
    placeholder: "Make a Selection",
    options: [],
  };

  pageNames.forEach((category, index) => {
    selction.options.push({
      label: `Page ${index + 1}`,
      value: (index + 1).toString(),
      description: `Go to ${category} page`,
    });
  });

  let menu = {
    type: MessageComponentTypes.ACTION_ROW,
    components: [
      selction
    ],
  };

  let currentPage = 0;

  if (embeds.length == 0) return;

  let totalPages = embeds.length;

  // console.log(interaction.type, InteractionType.APPLICATION_COMMAND)
  if (interaction.type == InteractionType.APPLICATION_COMMAND) {
    console.log("Application Command");
    type = 'command';
    // if (deferred) {
      console.log("Deferred");
      // edit defered message
      sent = await interaction.edit({
        embeds: [addPageNumber(embeds[0], currentPage, totalPages)],
        components: [navigation, menu],
      });
      // console.log("Pag: ", JSON.stringify(sent, null, 2));
    // } else {
    //   console.log("Not Deferred");
    //   interaction.respond({
    //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    //     data: {
    //       embeds: [addPageNumber(embeds[0], currentPage, totalPages)],
    //       components: [navigation, menu],
    //     },
    //   });
    // }
  }
  const filter = (i) => i.member.user.id == (interaction.member.user.id) && (i.data.component_type == MessageComponentTypes.STRING_SELECT || i.data.component_type == MessageComponentTypes.BUTTON);
  let startTime = new Date().getTime();
  const isExpired = () => {
    return new Date().getTime() > startTime + time;
  };

  const paginate = async (data) => {
    // console.log(data.interaction.message.id, interaction)
    if (data.interaction.message.id != sent.id) return;
    const { interaction: i, res: res2 } = data;
    console.log("Paginate");
    if (!filter(i)) return;
    if (isExpired()) {
      interaction.collector.removeListener("collect", paginate);
      interaction.collector.removeListener("end", paginate);
      return;
    }
    console.log("Custom ID", i.data.custom_id)
    switch (i.data.custom_id) {
      case "first":
        currentPage = 0;
        break;
      case "previous":
        currentPage == 0 ? currentPage = 0 : currentPage--;
        break;
      case "next":
        currentPage == embeds.length - 1 ? currentPage = embeds.length - 1 : currentPage++;
        break;
      case "last":
        currentPage = embeds.length - 1;
        break;
      case "selection":
        if (i.data.component_type !== MessageComponentTypes.STRING_SELECT) break;
        currentPage = parseInt(i.data.values[0]) - 1;
        break;
    }
    console.log("Current Page", currentPage + 1);
    if (i.data.custom_id == 'stop') {
      i.respond({
        type: InteractionResponseType.UPDATE_MESSAGE,
        data: {
          embeds: [addPageNumber(embeds[currentPage], currentPage, totalPages)],
          components: [],
        },
      });
      interaction.collector.removeListener("collect", paginate);
      interaction.collector.removeListener("end", paginate);
    } else {
      i.respond({
        type: InteractionResponseType.UPDATE_MESSAGE,
        data: {
          embeds: [addPageNumber(embeds[currentPage], currentPage, totalPages)],
          components: [navigation, menu],
        },
      });
    }
  };
  interaction.collector.on("collect", paginate);
}

function addPageNumber(embed, currentPage, totalPages) {
  embed.footer = {
    text: `Page ${currentPage + 1} of ${totalPages}`,
  };
  return embed;
}

module.exports = { MessageEmbedsPagination };
