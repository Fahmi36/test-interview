import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'
import { articleService } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import type { ArticleResponse } from '@/types/article'

const CATEGORIES = [
  'Teknologi',
  'Pendidikan',
  'Kesehatan',
  'Bisnis',
  'Olahraga',
  'Hiburan',
  'Travel',
  'Food',
  'Lifestyle',
  'Lainnya'
]

export default function EditArticle() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionType, setActionType] = useState<'publish' | 'draft' | null>(null)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)
  const isSubmitting = useRef(false)
  const pendingAutoSave = useRef<Promise<void> | null>(null)

  useEffect(() => {
    const loadArticle = async () => {
      if (location.state?.article) {
        const article = location.state.article as ArticleResponse
        setTitle(article.title)
        setContent(article.content)
        setCategory(article.category)
        setFetchLoading(false)
      } else if (id) {
        try {
          const article = await articleService.getArticleById(parseInt(id))
          setTitle(article.title)
          setContent(article.content)
          setCategory(article.category)
        } catch (error) {
          console.error('Failed to load article:', error)
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Gagal memuat artikel',
            confirmButtonColor: '#1f2937',
          }).then(() => {
            navigate('/all-posts')
          })
        } finally {
          setFetchLoading(false)
        }
      }
    }
    loadArticle()
  }, [id, location.state, navigate])

  const validateForm = () => {
    if (!title || !content || !category) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Semua field wajib diisi',
        confirmButtonColor: '#1f2937',
      })
      return false
    }

    if (title.length < 20) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Title minimal 20 karakter',
        confirmButtonColor: '#1f2937',
      })
      return false
    }

    if (content.length < 200) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Content minimal 200 karakter',
        confirmButtonColor: '#1f2937',
      })
      return false
    }

    return true
  }

  const autoSaveDraft = async () => {
    if (isSubmitting.current) return
    if (!id || !title || !content || !category) return
    if (title.length < 20 || content.length < 200) return

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }

    autoSaveTimer.current = setTimeout(async () => {
      if (isSubmitting.current) return
      
      setSaving(true)
      const savePromise = (async () => {
        try {
          await articleService.updateArticle(parseInt(id!), {
            title,
            content,
            category,
            status: 'draft',
          })
        } catch (error) {
          console.error('Auto-save failed:', error)
        } finally {
          setSaving(false)
          if (pendingAutoSave.current === savePromise) {
            pendingAutoSave.current = null
          }
        }
      })()
      
      pendingAutoSave.current = savePromise
      await savePromise
    }, 2000)
  }

  const handleTitleBlur = () => {
    if (!isSubmitting.current) {
      autoSaveDraft()
    }
  }

  const handleContentBlur = () => {
    if (!isSubmitting.current) {
      autoSaveDraft()
    }
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
  }

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    if (id && title && content && category && !fetchLoading && !isSubmitting.current) {
      if (title.length >= 20 && content.length >= 200) {
        autoSaveDraft()
      }
    }
  }, [title, content, category])

  const handlePublish = async () => {
    if (!validateForm() || !id) return

    isSubmitting.current = true
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = null
    }

    if (pendingAutoSave.current) {
      await pendingAutoSave.current
    }

    setLoading(true)
    setActionType('publish')

    try {
      await articleService.updateArticle(parseInt(id), {
        title,
        content,
        category,
        status: 'publish',
      })
      
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Artikel berhasil diupdate dan dipublish',
        confirmButtonColor: '#1f2937',
        timer: 1500,
        showConfirmButton: false,
      })
      
      navigate('/all-posts')
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.error || 'Gagal update artikel',
        confirmButtonColor: '#1f2937',
      })
    } finally {
      isSubmitting.current = false
      setLoading(false)
      setActionType(null)
    }
  }

  const handleDraft = async () => {
    if (!validateForm() || !id) return

    isSubmitting.current = true
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = null
    }

    if (pendingAutoSave.current) {
      await pendingAutoSave.current
    }

    setLoading(true)
    setActionType('draft')

    try {
      await articleService.updateArticle(parseInt(id), {
        title,
        content,
        category,
        status: 'draft',
      })
      
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Artikel berhasil diupdate dan disimpan sebagai draft',
        confirmButtonColor: '#1f2937',
        timer: 1500,
        showConfirmButton: false,
      })
      
      navigate('/all-posts')
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.error || 'Gagal update artikel',
        confirmButtonColor: '#1f2937',
      })
    } finally {
      isSubmitting.current = false
      setLoading(false)
      setActionType(null)
    }
  }

  const titleValid = title.length >= 20
  const contentValid = content.length >= 200
  const categoryValid = category.length >= 3
  const isPublishing = loading && actionType === 'publish'
  const isSavingDraft = loading && actionType === 'draft'

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-gray-500">Loading article...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/all-posts')}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
          <p className="text-sm text-gray-500 mt-1">Update your article</p>
        </div>
        {saving && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="hidden sm:inline">Auto-saving as draft...</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Judul artikel minimal 20 karakter"
            className={title && !titleValid ? 'border-red-500' : ''}
            disabled={loading}
          />
          <p className={`text-xs ${titleValid ? 'text-gray-500' : 'text-red-500'}`}>
            {title.length}/20 karakter {titleValid ? '✓' : '(minimal 20)'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium">
            Content <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleContentBlur}
            placeholder="Konten artikel minimal 200 karakter"
            rows={12}
            className={content && !contentValid ? 'border-red-500' : ''}
            disabled={loading}
          />
          <p className={`text-xs ${contentValid ? 'text-gray-500' : 'text-red-500'}`}>
            {content.length}/200 karakter {contentValid ? '✓' : '(minimal 200)'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            id="category"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={loading}
          >
            <option value="">Pilih kategori</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            onClick={handlePublish}
            disabled={loading || !titleValid || !contentValid || !categoryValid}
            className="flex-1"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleDraft}
            disabled={loading || !titleValid || !contentValid || !categoryValid}
            className="flex-1"
          >
            {isSavingDraft ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Draft'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
