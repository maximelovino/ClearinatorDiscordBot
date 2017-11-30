//Doc for the lib: https://discord.js.org/#/docs/main/stable/general/welcome
const discord = require('discord.js');
const log = require('winston');
require('dotenv').config({ path: 'keys.env' });
const token = process.env.BOT_TOKEN;
let mancheMode = false;

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
	let result;
	const canClear = message.member.permissions.has("MANAGE_MESSAGES");
	//add word bound with \b before di... group
	const mancheRegEx = new RegExp('(?:.*)\\b(?:di(?:(?:s|t)[\\s-])?)(.*)', 'gi');
	if (message.content === "$clear" && canClear) {
		message.channel.fetchMessages({ limit: 100 }).then(messages => {
			deleteAllNotPinned(messages);
		}).catch(e => log.error(e));
	} else if ((result = mancheRegEx.exec(message.content)) != null && mancheMode) {
		log.info(`Matched message, gonna write ${result[1]}`);
		message.channel.send(result[1].trim());
	} else if (message.content === "$mancheMode") {
		if (mancheMode) {
			message.channel.send("Deactivating MANCHE mode");
		} else {
			message.channel.send("Activating MANCHE mode");
		}
		mancheMode = !mancheMode;
	}
	log.info(canClear);
});

bot.login(token);

function deleteAllNotPinned(messagesCollection) {
	const messages = Array.from(messagesCollection.values());
	const notPinned = messages.filter(m => !m.pinned);
	log.info(`Deleting ${notPinned.length} out of ${messages.length} `);
	//we can map to the promise and wait with Promise.all afterwards
	notPinned.forEach(message => {
		message.delete()
			.then(msg => log.info(`Deleted message: ${msg.content} `))
			.catch(e => log.error(e));
	});
}