const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require('axios');

const {
    prefix,
    token
} = require("./config.json");

function sendMessage(messageReceive, msg) {
    console.log(messageReceive.guild.name + " : " + msg);
    messageReceive.channel.send(msg);
}


function getRank(message, id, handle) {

    axios.get('https://api.tracker.gg/api/v2/rocket-league/standard/profile/epic/'+id)
    .then(res => {

        if (res.status == 404) {
            sendMessage(message, "Enter a valid player id !");
            return;
        }

        const data = res.data.data;
        handle(message, data);
    })
    .catch(err => {
        console.log('Error: ', err.message);
    });
}


function sendRank (message, data) {
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


function sendShots (message, data) {
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


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", function (message) {

    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();

    if (command === 'rank') {

        if (!args.length) {
            sendMessage(message, "Enter a player id !");
            return;
        }

        const playerid = args[0];

        getRank(message, playerid, sendRank);
    }
    else if (command === 'shots') {

        if (!args.length) {
            sendMessage(message, "Enter a player id !");
            return;
        }

        const playerid = args[0];

        getRank(message, playerid, sendShots);
    }
})

client.login(token);