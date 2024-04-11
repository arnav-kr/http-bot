async function editResponse({ interaction, body }) {
  let sentRes = await fetch(`https://discord.com/api/v9/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Signature-Timestamp": interaction.timestamp,
      "X-Signature-Ed25519": interaction.signature,
    },
    body: JSON.stringify({
      thread_id: interaction.channel_id,
      ...body
    }),
  });
  let sent = await sentRes.json();
  // console.log(JSON.stringify(sent, null, 2));
  return sent;
}

module.exports = editResponse;