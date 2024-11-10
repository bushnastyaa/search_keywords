import {useSocketStore} from "../../providers/SocketProvider";

export const UrlList = () => {
    const {urlList, searchItem, error, socket} = useSocketStore();

    const downloadContent = (url) => {
        socket?.send( {
            type: 'download',
            url
        })
    }

    if (error) {
        return null;
    }

    return (
        <div hidden={!urlList?.length} className="urlList">
            <ul>
                {urlList?.map((url) => (
                    <li key={url}>
                        <p>{url}</p>
                        <button className="button" onClick={() => downloadContent(url)}>
                            Скачать
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
};