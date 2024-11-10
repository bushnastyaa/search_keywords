import {useSocketStore} from "../../providers/SocketProvider";

export const DownloadedContent = () => {
    const {downloadedContent} = useSocketStore();

    if (!downloadedContent || !downloadedContent.length) return null;

    return (
        <div className="loadedContent">
            <ul>
                {downloadedContent?.map((content, index) => (
                    <li key={index}>
                        <a href={`/${content?.split('/').at(-1)}`} download={content?.split('/').at(-1)}>
                            {content?.split('/').at(-1)} 
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}