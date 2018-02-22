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
	if (message.author == bot.user) {
		log.info("Message from myself, ignoring");
		return;
	}
	let result;
	const canClear = message.member.permissions.has(discord.Permissions.FLAGS.MANAGE_MESSAGES);
	//add word bound with \b before di... group
	const mancheRegEx = new RegExp('(?:.*)\\b(?:di(?:(?:s|t)[\\s-])?)(.*)', 'gi');
	const content = message.content.trim();

	if (content === "$clear" && canClear) {
		message.channel.fetchMessages({ limit: 100 }).then(messages => {
			deleteAllNotPinned(messages);
		}).catch(e => log.error(e));
	} else if ((result = mancheRegEx.exec(content)) != null && mancheMode) {
		log.info(`Matched message, gonna write ${result[1]}`);
		message.channel.send(result[1].trim());
	} else if (content === "$mancheMode") {
		if (mancheMode) {
			message.channel.send("Deactivating MANCHE mode");
		} else {
			message.channel.send("Activating MANCHE mode");
		}
		mancheMode = !mancheMode;
	} else if (content.startsWith("$notify")) {
		//TODO Don't notify the one who wrote, or the bot
		if (content === "$notify") {
			log.info("Notify with no timebase");
		} else {
			const timeString = content.split(" ")[1];
			const timeRegExp = new RegExp('([1-9][0-9]*)([h|m])', 'gi');
			result = timeRegExp.exec(timeString);
			if (result) {
				const timeValue = parseInt(result[1]);
				const timeUnit = result[2];
				log.info(`Notify with time`);
				log.info(`Value ${timeValue}, Unit ${timeUnit}`);
				constructMentionString(message.channel, message.author, timeValue, timeUnit);
			}
		}
	}
	//TODO add $help
	log.info(canClear);
});

bot.login(token);

function constructMentionString(channel, sender, timeValue, timeUnit) {

}

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