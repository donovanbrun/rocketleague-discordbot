const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require('axios');

// Configuration constants
const {
    prefix,
    token
} = require("./config.json");


// List of commands
const commands = [
    {
        "name": "help",
        "description" : "List all commands",
        "argsNumber": 0,
        "handle": help
    },
    {
        "name": "rank",
        "description" : "Gives you ranks for every gamemodes, use like : !rank [playerid]",
        "argsNumber": 1,
        "handle": sendRank
    },
    {
        "name": "shots",
        "description" : "Gives you shooting accuracy, use like : !shots [playerid]",
        "argsNumber": 1,
        "handle": sendShots
    }
]


// Send message in the discord channel where the user enter a command
function sendMessage(messageReceive, msg) {
    console.log(messageReceive.guild.name + " : " + msg);
    messageReceive.channel.send(msg);
}


function handleCommand(message, id, handle) {

    if (handle === help) {
        help(message);
        return;
    }

    axios.get('https://api.tracker.gg/api/v2/rocket-league/standard/profile/epic/'+id)
    .then(res => {
        const data = res.data.data;
        handle(message, data);
    })
    .catch(err => {
        sendMessage(message, "Enter a valid player id !");
    });
}


// Make a response with rank informations and send it back using sendMessage()
function sendRank(message, data) {
    console.log(data);
    var ret = "Ranks for **" + data.platformInfo.platformUserHandle + "** (" + data.platformInfo.platformUserIdentifier + ") "+ " :\n";

    var gamemodes = data.segments;
    gamemodes.forEach(element => {

        if (element.type === "playlist") {
            ret += "• " + element.metadata.name + " : "+ element.stats.rating.value + " (" + element.stats.tier.metadata.name + " - " + element.stats.division.metadata.name + ")" + "\n";
        }
    });

    sendMessage(message, ret);
}


// Make a response with shooting accuracy information and send it back using sendMessage()
function sendShots(message, data) {
    console.log(data);
    var ret = data.platformInfo.platformUserHandle + " has a shooting accuracy of ";

    var gamemodes = data.segments;
    gamemodes.forEach(element => {

        if (element.type === "overview") {
            ret += Math.trunc(element.stats.goalShotRatio.value) + "%";
            sendMessage(message, ret);
            return;
        }
    });
}


// Make a list of all commands and send it back using sendMessage()
function help(message) {
    var ret = "Commands :\n";
    commands.forEach(cmd => {
        ret += "• " + prefix + cmd.name + " : " + cmd.description + "\n";
    })
    sendMessage(message, ret);
}


// On bot starting
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// When receiving a message (in our case a command)
client.on("message", function (message) {

    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();

    commands.forEach(cmd => {
        if (cmd.name === command) {
            if (cmd.argsNumber == args.length) {
                handleCommand(message, args[0], cmd.handle);
            }
            else {
                sendMessage(message, "Wrong command usage, use !help to see how to use this command.")
            }
            return;
        }
    })
})

client.login(token);