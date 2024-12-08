var http = require('http');

function startServer() {
    http.createServer(function (req, res) {
        res.write("En línea"); // Respuesta simple al visitar el servidor.
        res.end();
    }).listen(8080, () => {
        console.log('Servidor keep-alive escuchando en el puerto 8080');
    });
}

module.exports = startServer; // Exporta la función para usarla en el bot.
