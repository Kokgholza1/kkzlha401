const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Cambia tu apodo a [𝐅.𝐄.𝐑] + tu nombre actual.'),
    async execute(interaction) {
        const member = interaction.member;

        if (!member.manageable) {
            await interaction.reply({
                content: 'No puedo cambiar tu apodo, verifica mis permisos.',
                ephemeral: true,
            });
            return;
        }

        const currentNickname = member.nickname || member.user.username;
        const newNickname = `[𝐅.𝐄.𝐑] ${currentNickname}`;

        try {
            await member.setNickname(newNickname);
            await interaction.reply({
                content: `¡Tu apodo ha sido cambiado a **${newNickname}**!`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error al cambiar el apodo:', error);
            await interaction.reply({
                content: 'Hubo un error al intentar cambiar tu apodo.',
                ephemeral: true,
            });
        }
    },
};
