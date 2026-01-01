import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Stock from './pages/Stock'
import News from './pages/News'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/stock' element={<Stock />}/>
        <Route path='/news' element={<News />}/>
      </Routes>
    </Layout>
  )
}

export default App
