const discord = require('discord.io');
const log = require('winston');
require('dotenv').config({ path: 'keys.env' });
const token = process.env.BOT_TOKEN;

// Configure logger settings
log.remove(log.transports.Console);
log.add(log.transports.Console, {
	colorize: true
});
log.level = 'debug';

const bot = new discord.Client({
	token,
	autorun: true,
});

bot.on('ready', (event) => {
	log.info('Connected');
	log.info('Logged in as: ');
	log.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', (user, userID, channelID, message, event) => {
	if (userID !== bot.id) {
		if (message.match('.*(C|c)learinator.*')) {
			log.info(`${message} matches`);
			bot.sendMessage({
				to: channelID,
				message: "On parle de moi?"
			});
		} else if (message === '$clear') {
			log.info("Clearing all messages");
			clearAllChannelMessages(channelID);
		} else {
			log.info(`${message} doesn't match`);
		}
	}
});

function clearAllChannelMessages(channelID) {
	bot.getMessages({
		channelID,
		limit: 100,
	}, (error, messages) => {

		const notPinned = messages.filter(m => !m.pinned);
		log.info(`${notPinned.length} out of ${messages.length}`);

		const idsToDel = notPinned.map(m => m.id);
		if (idsToDel.length != 0) {
			bot.deleteMessages({
				channelID,
				messageIDs: idsToDel,
			}, (error, response) => {
				log.error(error);
				log.info(response);
			});
		}
	});
}