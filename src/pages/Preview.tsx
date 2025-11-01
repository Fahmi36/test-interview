import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { articleService } from '@/services/api'
import { Button } from '@/components/ui/button'
import type { ArticleResponse } from '@/types/article'

const ITEMS_PER_PAGE = 5

export default function Preview() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<ArticleResponse[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      try {
        const data = await articleService.getArticles(1000, 0)
        const published = data.filter((article) => article.status === 'publish')
        setArticles(published)
      } catch (error) {
        console.error('Failed to fetch articles:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [])

  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedArticles = articles.slice(startIndex, endIndex)

  const handleArticleClick = (article: ArticleResponse) => {
    navigate(`/preview/${article.id}`, { state: { article } })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-gray-500">Loading articles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Blog Articles</h1>
        <p className="text-sm text-gray-500">Published articles</p>
      </div>

      {paginatedArticles.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No published articles yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {paginatedArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleArticleClick(article)}
              >
                <div className="mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {article.category}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors">
                  {article.title}
                </h2>
                <div
                  className="prose prose-slate max-w-none text-gray-700 leading-relaxed line-clamp-3"
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {article.content.substring(0, 200)}...
                </div>
                <div className="mt-4">
                  <span className="text-sm text-blue-600 font-medium hover:text-blue-700">
                    Read more →
                  </span>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border border-gray-200 p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <span className="text-sm text-gray-600 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

