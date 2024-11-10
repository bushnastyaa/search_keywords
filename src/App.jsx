import { useState } from 'react'
import './App.css'
import { SearchItem } from './components/SearchItem'
import { UrlList } from './components/UrlList'
import { DownloadingProgress } from './components/DownloadingProgress'
import { DownloadedContent } from './components/DownloadedContent'
import { WorkerCount } from './components/WorkerCount'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
        <h1>Поиск по ключевым словам</h1>
        <p className='subtext'>Например: music</p>
        <WorkerCount/>
        <div className="container">
            <SearchItem/>
            <UrlList/>
            <DownloadingProgress/>
            <DownloadedContent/>
        </div>
    </main>
  )
}

export default App