import express from 'express';
import http from 'http';
import path from 'path';
import {fileURLToPath} from "url";
import fs from 'fs';
import {Server} from 'socket.io';
import {Worker} from 'worker_threads';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 443;
const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server, {
    path: "/wss",
    cors: {
        origin: '*'
    }
});

const keywordsToUrls = {
    "music": [
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    ],
    'tinycore': [
        'http://www.tinycorelinux.net/15.x/x86/release/Core-current.iso',
        'http://www.tinycorelinux.net/14.x/x86/archive/14.0/Core-14.0.iso',
        'http://www.tinycorelinux.net/13.x/x86/archive/13.1/Core-13.1.iso'
    ],
};

// Worker configuration and state variables
const WORKERS_CONFIG = {
    MAX_WORKERS: '2',
    SPEED_LIMIT: '1024'
}

let currentWorkerCount = 0;
let threadId = 1;
const pendingDownloads = [];
const maxWorkerCount = WORKERS_CONFIG.MAX_WORKERS;
const speedLimit = WORKERS_CONFIG.SPEED_LIMIT * 1024 * 1024;

const setupSocketListeners = (socket) => {
    socket.on('message', async (message) => {
        const { type, keyword, url } = message;
        if (type === 'get_urls') {
            handleGetUrls(socket, keyword);
        } else if (type === 'download') {
            handleDownload(socket, url);
        }
    });
};

const handleGetUrls = (socket, keyword) => {
    const urls = keywordsToUrls[keyword];
    if (urls) {
        socket.emit('url_list', { type: 'url_list', urls });
    } else {
        socket.emit('error', { type: 'error', message: 'Keyword not found' });
    }
};

const handleDownload = (socket, url) => {
    const filePath = path.join(__dirname, '..', 'public', path.basename(url));

    if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    if (currentWorkerCount < maxWorkerCount) {
        startDownload(socket, url, filePath);
    } else {
        pendingDownloads.push(() => startDownload(socket, url, filePath));
    }
};

const startDownload = (socket, url, filePath) => {
    currentWorkerCount++;
    threadId++;
    socket.emit('workers', { type: 'workers', threadId, currentWorkerCount, maxWorkerCount });

    const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
        workerData: { url, filePath, threadId, speedLimit }
    });

    worker.on('message', (message) => handleWorkerMessage(socket, message));
    worker.on('error', (error) => handleWorkerError(socket, error));
    worker.on('exit', (code) => handleWorkerExit(socket, code));
};

const handleWorkerMessage = (socket, message) => {
    if (message.type === 'progress') {
        socket.emit('progress', { ...message, fileName: message.fileName });
    } else if (message.type === 'complete') {
        socket.emit('complete', { type: 'complete', fileName: message.fileName });
    }
};

const handleWorkerError = (socket, error) => {
    socket.emit('error', { type: 'error', message: error.message });
};

const handleWorkerExit = (socket, code) => {
    currentWorkerCount--;
    const threadIdFake = 0;
    socket.emit('worker_count', {threadIdFake, currentWorkerCount, maxWorkerCount });

    if (code !== 0) {
        socket.emit('error', { type: 'error', message: `Worker stopped with exit code ${code}` });
    }

    if (currentWorkerCount < maxWorkerCount && pendingDownloads.length > 0) {
        const nextDownload = pendingDownloads.shift();
        nextDownload && nextDownload();
    }
};

io.on('connection', (socket) => {
    setupSocketListeners(socket);
    console.log('Подключение успешно');
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на ${PORT} порту`);
});
