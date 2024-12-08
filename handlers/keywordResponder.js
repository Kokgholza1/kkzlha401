// Lista de palabras clave
const keywords = ['tag', 'clan tag', 'tag del clan', 'prefijo'];

// Respuesta del bot
const clanTagResponse = 'El tag del clan que debes poner dentro del launcher es **F.E.R|**';

module.exports = {
    handle: async (message) => {
        // Ignorar mensajes del propio bot
        if (message.author.bot) return;

        // Convertir el mensaje a minúsculas y buscar palabras clave
        const messageContent = message.content.toLowerCase();
        if (keywords.some(keyword => messageContent.includes(keyword))) {
            // Enviar respuesta
            await message.reply(clanTagResponse).catch(console.error);
        }
    },
};
