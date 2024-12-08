const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('registrar')
        .setDescription('Registra tu nickname y enlace de estadísticas de Project Reality.')
        .addStringOption(option =>
            option
                .setName('nickname')
                .setDescription('Tu nickname del juego')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('enlace')
                .setDescription('El enlace a tus estadísticas de la página PRSTATS')
                .setRequired(true)
        ),
    async execute(interaction) {
        const nickname = interaction.options.getString('nickname').trim();
        const enlace = interaction.options.getString('enlace').trim();
        const enlaceRegex = /^https:\/\/prstats\.realitymod\.com\/player\/\d+\/[\w-]+$/;

        if (!enlaceRegex.test(enlace)) {
            await interaction.reply({
                content: 'El enlace proporcionado no es válido. Asegúrate de que siga este formato:\n`https://prstats.realitymod.com/player/399837/nikoo24`',
                ephemeral: true,
            });
            return;
        }

        let players;
        try {
            players = JSON.parse(fs.readFileSync('./players.json', 'utf-8'));
        } catch {
            players = {};
        }

        // Verificar que el enlace no esté registrado
        if (Object.values(players).includes(enlace)) {
            await interaction.reply({
                content: 'Este enlace ya está registrado por otro usuario.',
                ephemeral: true,
            });
            return;
        }

        // Registrar el nick con el enlace
        players[nickname.toLowerCase()] = enlace;

        try {
            fs.writeFileSync('./players.json', JSON.stringify(players, null, 2), 'utf-8');
            await interaction.reply({
                content: `El jugador **${nickname}** ha sido registrado exitosamente.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error al guardar el registro:', error);
            await interaction.reply({
                content: 'Hubo un error al registrar tu información. Por favor, inténtalo más tarde.',
                ephemeral: true,
            });
        }
    },
};
