const express = require('express');
const path = require('path');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const app = express();
const PORT = 3000;

// 🔁 Configura livereload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));

// Inyecta el script de livereload en las páginas HTML
app.use(connectLivereload());

// Archivos estáticos
app.use('/', express.static(path.join(__dirname, 'public')));

// Recargar navegador al detectar cambios
liveReloadServer.server.once('connection', () => {
	setTimeout(() => {
		liveReloadServer.refresh('/');
	}, 100);
});

// Inicia el servidor
app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
