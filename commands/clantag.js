const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clantag')
        .setDescription('Muestra el tag del clan para usar en el launcher.'),
    async execute(interaction) {
        await interaction.reply({
            content: 'El tag del clan que debes poner dentro del launcher es **F.E.R|**',
            ephemeral: true,
        });
    },
};
