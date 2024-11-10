import { parentPort, workerData } from 'worker_threads';
import axios from 'axios';
import fs from 'fs';

const { url, filePath, threadId, speedLimit } = workerData;

const reportProgress = (downloadedLength, totalLength) => {
    parentPort?.postMessage({
        type: 'progress',
        threadId,
        fileName: filePath,
        progress: (downloadedLength / totalLength) * 100,
        downloadedLength: formatBytes(downloadedLength),
        contentLength: formatBytes(totalLength)
    });
};

const downloadFile = async () => {
    const writer = fs.createWriteStream(filePath);
    const response = await axios.get(url, {
        responseType: 'stream'
    });

    const totalLength = parseInt(response.headers['content-length'], 10);
    let downloadedLength = 0;

    response.data.on('data', (chunk) => {
        downloadedLength += chunk.length;
        reportProgress(downloadedLength, totalLength);
        
        if (downloadedLength > speedLimit) {
            response.data.pause();
            setTimeout(() => response.data.resume(), 1000);
        }
    });

    response.data.pipe(writer);

    writer.on('finish', () => {
        parentPort?.postMessage({ type: 'complete', fileName: filePath });
    });

    writer.on('error', (err) => {
        parentPort?.postMessage({ type: 'error', message: err.message });
    });
};

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

downloadFile();
