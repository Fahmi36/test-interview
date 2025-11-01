import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, Trash2, Plus, RotateCcw } from 'lucide-react'
import Swal from 'sweetalert2'
import { articleService } from '@/services/api'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { ColumnDef } from '@tanstack/react-table'
import type { ArticleResponse } from '@/types/article'

type TabType = 'publish' | 'draft' | 'thrash'

export default function AllPosts() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('publish')
  const [articles, setArticles] = useState<ArticleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [trashingId, setTrashingId] = useState<number | null>(null)
  const [restoringId, setRestoringId] = useState<number | null>(null)

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const data = await articleService.getArticles(1000, 0)
      setArticles(data)
    } catch (error) {
      console.error('Failed to fetch articles:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Gagal memuat artikel',
        confirmButtonColor: '#1f2937',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      if (activeTab === 'publish') return article.status === 'publish'
      if (activeTab === 'draft') return article.status === 'draft'
      if (activeTab === 'thrash') return article.status === 'thrash'
      return false
    })
  }, [articles, activeTab])

  const handleEdit = (article: ArticleResponse) => {
    navigate(`/edit/${article.id}`, { state: { article } })
  }

  const handleTrash = async (article: ArticleResponse) => {
    const result = await Swal.fire({
      title: 'Move to Trash?',
      text: `Apakah Anda yakin ingin memindahkan "${article.title}" ke trash?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, move it!',
      cancelButtonText: 'Cancel',
    })

    if (!result.isConfirmed) return

    setTrashingId(article.id)
    try {
      await articleService.updateArticle(article.id, { ...article, status: 'thrash' })
      
      await Swal.fire({
        icon: 'success',
        title: 'Moved!',
        text: 'Artikel berhasil dipindahkan ke trash',
        confirmButtonColor: '#1f2937',
        timer: 1500,
        showConfirmButton: false,
      })
      
      await fetchArticles()
    } catch (error) {
      console.error('Failed to trash article:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Gagal memindahkan artikel ke trash',
        confirmButtonColor: '#1f2937',
      })
    } finally {
      setTrashingId(null)
    }
  }

  const handleRestore = async (article: ArticleResponse) => {
    const result = await Swal.fire({
      title: 'Restore Article?',
      text: `Apakah Anda yakin ingin memulihkan "${article.title}" ke draft?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1f2937',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, restore it!',
      cancelButtonText: 'Cancel',
    })

    if (!result.isConfirmed) return

    setRestoringId(article.id)
    try {
      await articleService.updateArticle(article.id, { ...article, status: 'draft' })
      
      await Swal.fire({
        icon: 'success',
        title: 'Restored!',
        text: 'Artikel berhasil dipulihkan ke draft',
        confirmButtonColor: '#1f2937',
        timer: 1500,
        showConfirmButton: false,
      })
      
      await fetchArticles()
      setActiveTab('draft')
    } catch (error) {
      console.error('Failed to restore article:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Gagal memulihkan artikel',
        confirmButtonColor: '#1f2937',
      })
    } finally {
      setRestoringId(null)
    }
  }

  const columns: ColumnDef<ArticleResponse>[] = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <div className="font-medium text-sm max-w-md truncate">
              {row.original.title}
            </div>
          )
        },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        enableSorting: true,
        cell: ({ row }) => {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {row.original.category}
            </span>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status
          const statusColors: Record<string, { bg: string; text: string }> = {
            publish: { bg: 'bg-green-100', text: 'text-green-800' },
            draft: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
            thrash: { bg: 'bg-red-100', text: 'text-red-800' },
          }
          const colors = statusColors[status] || statusColors.draft
          
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const article = row.original
          const isTrashing = trashingId === article.id
          const isRestoring = restoringId === article.id
          
          return (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEdit(article)}
                disabled={isTrashing || isRestoring}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              {activeTab === 'thrash' ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => handleRestore(article)}
                  disabled={isTrashing || isRestoring}
                >
                  {isRestoring ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5" />
                  )}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleTrash(article)}
                  disabled={isTrashing || isRestoring}
                >
                  {isTrashing ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [activeTab, trashingId, restoringId]
  )

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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Posts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your articles</p>
        </div>
        <Button onClick={() => navigate('/add')} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="p-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="publish" className="text-xs sm:text-sm">Published</TabsTrigger>
            <TabsTrigger value="draft" className="text-xs sm:text-sm">Drafts</TabsTrigger>
            <TabsTrigger value="thrash" className="text-xs sm:text-sm">Trashed</TabsTrigger>
          </TabsList>

          <TabsContent value="publish" className="mt-4">
            <DataTable columns={columns} data={filteredArticles} />
          </TabsContent>

          <TabsContent value="draft" className="mt-4">
            <DataTable columns={columns} data={filteredArticles} />
          </TabsContent>

          <TabsContent value="thrash" className="mt-4">
            <DataTable columns={columns} data={filteredArticles} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
