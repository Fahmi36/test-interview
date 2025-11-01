import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { articleService } from '@/services/api'
import { Button } from '@/components/ui/button'
import type { ArticleResponse } from '@/types/article'

export default function ArticleDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const [article, setArticle] = useState<ArticleResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadArticle = async () => {
      if (location.state?.article) {
        setArticle(location.state.article as ArticleResponse)
        setLoading(false)
      } else if (id) {
        try {
          const data = await articleService.getArticleById(parseInt(id))
          setArticle(data)
        } catch (error) {
          console.error('Failed to load article:', error)
          navigate('/preview')
        } finally {
          setLoading(false)
        }
      }
    }
    loadArticle()
  }, [id, location.state, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-gray-500">Loading article...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Article not found</p>
          <Button
            variant="outline"
            onClick={() => navigate('/preview')}
            className="mt-4"
          >
            Back to Preview
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/preview')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <article className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {article.category}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          {article.title}
        </h1>
        <div
          className="prose prose-slate max-w-none text-gray-700 leading-relaxed"
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {article.content}
        </div>
      </article>
    </div>
  )
}

