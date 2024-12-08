const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Obtén estadísticas de un jugador de Project Reality.')
        .addStringOption(option =>
            option
                .setName('nickname')
                .setDescription('El nickname del jugador')
                .setAutocomplete(true) // Habilitar autocompletado
                .setRequired(true)
        ),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        let players;

        try {
            players = JSON.parse(fs.readFileSync('./players.json', 'utf-8'));
        } catch {
            players = {};
        }

        const choices = Object.keys(players).filter(nick =>
            nick.startsWith(focusedValue)
        );

        await interaction.respond(
            choices.map(nick => ({ name: nick, value: nick }))
        );
    },
    async execute(interaction) {
        const nickname = interaction.options.getString('nickname').toLowerCase();

        let players;
        try {
            players = JSON.parse(fs.readFileSync('./players.json', 'utf-8'));
        } catch {
            players = {};
        }

        const playerLink = players[nickname];

        if (!playerLink) {
            await interaction.reply({
                content: `No se encontró el jugador **${nickname}** en la base de datos.`,
                ephemeral: true,
            });
            return;
        }

        try {
            // Defer la respuesta si tomará más de 3 segundos
            await interaction.deferReply({ ephemeral: true });

            // Hacer la solicitud a la página del jugador
            const response = await axios.get(playerLink);
            const $ = cheerio.load(response.data);

            // Seleccionar el contenedor principal donde están los datos
            const profileContainer = $('.profile-text');

            const totalScore = profileContainer.find('h6:contains("TOTAL SCORE")').prev('h4').text().trim() || 'N/A';
            const totalKills = profileContainer.find('h6:contains("TOTAL KILLS")').prev('h4').text().trim() || 'N/A';
            const totalDeaths = profileContainer.find('h6:contains("TOTAL DEATHS")').prev('h4').text().trim() || 'N/A';

            const kdRatio = totalKills !== 'N/A' && totalDeaths !== 'N/A'
                ? (parseInt(totalKills, 10) / Math.max(1, parseInt(totalDeaths, 10))).toFixed(2)
                : 'N/A';

            const statsMessage = `
**${nickname}**
💎 Puntaje Total: ${totalScore}
💥 Kills: ${totalKills}
💀 Muertes: ${totalDeaths}
🔰 K/D Ratio: ${kdRatio}
[Ver más detalles aquí](${playerLink})
`;

            await interaction.editReply({
                content: statsMessage,
            });
        } catch (error) {
            console.error(`Error al obtener datos del jugador ${nickname}:`, error);

            if (interaction.deferred || interaction.replied) {
                // Si la interacción ya fue diferida o respondida
                await interaction.editReply({
                    content: `Hubo un problema al obtener la información de **${nickname}**. Por favor, inténtalo más tarde.`,
                });
            } else {
                // Respuesta inicial si no fue diferida
                await interaction.reply({
                    content: `Hubo un problema al obtener la información de **${nickname}**. Por favor, inténtalo más tarde.`,
                    ephemeral: true,
                });
            }
        }
    },
};
