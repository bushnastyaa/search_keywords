import {useRef, useState} from "react";
import {useSocketStore} from "../../providers/SocketProvider";

export const SearchItem = () => {
    const {socket, setSearchItem} = useSocketStore();
    const [value, setValue] = useState('');
    const inputRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (value === '') return;
        setValue('');
        setSearchItem(value);
        inputRef.current?.focus();
        socket.send( {type: 'get_urls', keyword: value});
    };

    return (
        <form onSubmit={handleSearch}>
            <label>
                <input 
                    ref={inputRef} 
                    type="text" 
                    className="button"
                    placeholder='Укажите ключевое слово'
                    value={value} 
                    onChange={(e) => setValue(e.target.value)}
                />
            </label>
            <button type="submit" className="button">Поиск</button>
        </form>
    )
}