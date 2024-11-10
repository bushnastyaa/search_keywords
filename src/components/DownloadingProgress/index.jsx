import {useSocketStore} from "../../providers/SocketProvider";

export const DownloadingProgress = () => {
    const {downloadProgress} = useSocketStore();

    if (!downloadProgress) return null;

    return (
        <div className="loadingProgress">
            <h2>Прогресс загрузки:</h2>
            <ul>
                {Object.entries(downloadProgress).map(([id, progress]) => (
                    <li key={id}>
                        <span>{progress.fileName.split('/').at(-1)}</span>
                        <span>
                            Размер: {progress.progress}% 
                            ({progress.downloadedLength}/{progress.contentLength})
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}