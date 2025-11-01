import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AllPosts from './pages/AllPosts'
import AddNew from './pages/AddNew'
import EditArticle from './pages/EditArticle'
import Preview from './pages/Preview'
import ArticleDetail from './pages/ArticleDetail'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/all-posts" replace />} />
          <Route path="/all-posts" element={<AllPosts />} />
          <Route path="/add" element={<AddNew />} />
          <Route path="/edit/:id" element={<EditArticle />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/preview/:id" element={<ArticleDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
