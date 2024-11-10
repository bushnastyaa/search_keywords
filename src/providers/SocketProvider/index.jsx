import {createContext, useContext, useEffect, useMemo, useState} from "react";
import {connect, Socket} from "socket.io-client";
import {wsURL} from "../../constants";

const SocketContext = createContext({});

export const SocketProvider = ({children}) => {
    const [socket, setSocket] = useState(null);
    const [workerCount, setWorkerCount] = useState({currentWorkerCount: 0, maxWorkerCount: 0});
    const [urlList, setUrlList] = useState([]);
    const [searchItem, setSearchItem] = useState('');
    const [error, setError] = useState('');
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [downloadedContent, setDownloadedContent] = useState([]);

    const updateData = (message) => {
        switch (message.type) {
            case 'workers':
                setWorkerCount({
                    currentWorkerCount: message.currentWorkerCount ?? 0,
                    maxWorkerCount: message.maxWorkerCount ?? 0
                });
                break;
            case 'url_list':
                setUrlList(message.urls ?? []);
                break;
            case 'progress':
                setDownloadProgress(prev => ({
                    ...prev,
                    [message.id]: {
                        fileName: message.fileName,
                        progress: message.progress.toFixed(2),
                        downloadedLength: message.downloadedLength,
                        contentLength: message.contentLength
                    }
                }));
                break;
            case 'complete':
                setDownloadedContent(prev => [...prev, message.fileName]);
                setDownloadProgress(prev => {
                    const updatedProgress = {...prev};
                    delete updatedProgress[Number(message.id)];
                    return updatedProgress;
                });
                break;
            case 'error':
                console.error(message.type, message.message);
                setError(message.message ?? '')
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        const socketInstance = connect(wsURL, {
            path: '/wss'
        });
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log('Connected to server');
        });

        const events = ['url_list', 'progress', 'workers', 'complete', 'error'];
        events.forEach(event => socketInstance.on(event, updateData));

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    useEffect(() => {
        setError('');
    }, [urlList]);

    const memoizedValues = useMemo(() => ({
        socket, workerCount, urlList, searchItem, setSearchItem, error, downloadProgress, downloadedContent
    }), [socket, workerCount, urlList, searchItem, error, downloadProgress, downloadedContent]);

    return <SocketContext.Provider value={memoizedValues}>{children}</SocketContext.Provider>
}

export const useSocketStore = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error("useSocketStore must be used within a SocketProvider");
    return context;
}