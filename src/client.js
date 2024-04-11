module.exports = class Client {
  constructor({
    commands,
    config,
  }) {
    this.commands = commands;
    this.config = config;
  }
  getEmoji(name) {
    return Object.keys(this.config.emojis).includes(name) ? this.config.emojis[name] : "";
  }
}