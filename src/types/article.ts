export interface Article {
  id?: number
  title: string
  content: string
  category: string
  status: 'publish' | 'draft' | 'thrash'
  created_date?: string
  updated_date?: string
}

export interface ArticleResponse {
  id: number
  title: string
  content: string
  category: string
  status: string
}

