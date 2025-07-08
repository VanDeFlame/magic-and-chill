const express = require('express');
const path = require('path');
const livereload = require('livereload');

const app = express();
const PORT = 3000;

// 🔁 Configura livereload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

// Archivos estáticos
app.use('/', express.static(path.join(__dirname, 'public')));

// Inicia el servidor
app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
