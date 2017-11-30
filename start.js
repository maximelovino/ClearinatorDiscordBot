//Doc for the lib: https://discord.js.org/#/docs/main/stable/general/welcome
const discord = require('discord.js');
const log = require('winston');
require('dotenv').config({ path: 'keys.env' });
const token = process.env.BOT_TOKEN;

// Configure logger settings
log.remove(log.transports.Console);
log.add(log.transports.Console, {
	colorize: true
});
log.level = 'debug';

const bot = new discord.Client();


bot.on('ready', () => {
	log.info('Connected');
});

bot.on('message', (message) => {
	log.info(`${message.author.username} - ${message.content}`);
	if (message.content === "$clear") {
		message.channel.fetchMessages({ limit: 100 }).then(messages => {
			deleteAllNotPinned(messages);
		}).catch(e => log.error(e));
	}
})

bot.login(token);

function deleteAllNotPinned(messagesCollection) {
	const messages = Array.from(messagesCollection.values());
	const notPinned = messages.filter(m => !m.pinned);
	log.info(`Deleting ${notPinned.length} out of ${messages.length}`);

	notPinned.forEach(message => {
		message.delete()
			.then(msg => log.info(`Deleted message: ${msg.content}`))
			.catch(console.error);
	});
}