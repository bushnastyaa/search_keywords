import {useSocketStore} from "../../providers/SocketProvider";

export const WorkerCount = () => {
    const {workerCount} = useSocketStore();

    return (
        <div className="workers">
            <div>
                Активные потоки: {workerCount?.currentWorkerCount} / {workerCount?.maxWorkerCount}
            </div>
        </div>
    )
}