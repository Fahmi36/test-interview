import axios from 'axios'
import type { Article, ArticleResponse } from '../types/article'

const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const articleService = {
  async createArticle(data: Omit<Article, 'id'>): Promise<number> {
    const response = await api.post<{ id: number }>('/article/', data)
    return response.data.id
  },

  async getArticles(limit: number = 100, offset: number = 0): Promise<ArticleResponse[]> {
    const response = await api.get<ArticleResponse[]>(`/article/${limit}/${offset}`)
    return response.data
  },

  async getArticleById(id: number): Promise<ArticleResponse> {
    const response = await api.get<ArticleResponse>(`/article/${id}`)
    return response.data
  },

  async updateArticle(id: number, data: Partial<Article>): Promise<void> {
    await api.put(`/article/${id}`, data)
  },

  async deleteArticle(id: number): Promise<void> {
    await api.delete(`/article/${id}`)
  },
}

