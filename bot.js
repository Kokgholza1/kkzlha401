const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const keywordResponder = require('./handlers/keywordResponder');
const startKeepAlive = require('./keep_alive'); // Importa el servidor "keep-alive"
require('dotenv').config(); // Usa variables de entorno para seguridad

// Variables de configuración
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    throw new Error('Faltan variables de entorno. Asegúrate de configurar BOT_TOKEN, CLIENT_ID y GUILD_ID.');
}

// Inicia el servidor "keep-alive"
startKeepAlive();

// Inicialización del cliente
const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Cargar comandos desde archivos
bot.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if (!command.data || !command.data.name || typeof command.execute !== 'function') {
        console.warn(`El archivo ${file} no tiene un comando válido.`);
        continue;
    }

    bot.commands.set(command.data.name, command);
}

// Registrar comandos en Discord
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('Registrando comandos...');
        const commands = bot.commands.map(command => command.data.toJSON());
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );
        console.log('Comandos registrados exitosamente.');
    } catch (error) {
        console.error('Error al registrar los comandos:', error);
    }
})();

// Evento cuando el bot está listo
bot.once('ready', () => {
    console.log(`${bot.user.tag} está listo para usarse.`);
});

// Evento para manejar interacciones (slash commands)
bot.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isAutocomplete()) {
            const command = bot.commands.get(interaction.commandName);
            if (!command || typeof command.autocomplete !== 'function') return;

            await command.autocomplete(interaction);
            return;
        }

        if (interaction.isCommand()) {
            const command = bot.commands.get(interaction.commandName);
            if (!command) {
                console.warn(`No se encontró el comando: ${interaction.commandName}`);
                return;
            }

            await command.execute(interaction);
        }
    } catch (error) {
        console.error(`Error procesando interacción: ${interaction.commandName}`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'Hubo un error al procesar tu solicitud.',
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: 'Hubo un error al ejecutar este comando.',
                ephemeral: true,
            });
        }
    }
});

// Evento para detectar mensajes (palabras clave)
bot.on('messageCreate', async (message) => {
    if (!message.guild || message.author.bot) return; // Ignora mensajes fuera de servidores o de bots
    try {
        await keywordResponder.handle(message);
    } catch (error) {
        console.error('Error procesando palabras clave:', error);
    }
});

// Iniciar sesión
bot.login(TOKEN).catch(error => {
    console.error('Error al iniciar sesión con el bot:', error);
});
