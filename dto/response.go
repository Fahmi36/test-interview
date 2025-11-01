package dto

// ArticleResponse response untuk artikel
type ArticleResponse struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Content  string `json:"content"`
	Category string `json:"category"`
	Status   string `json:"status"`
}

// ToResponse mengubah model menjadi response DTO
func ToResponse(id int, title, content, category, status string) *ArticleResponse {
	return &ArticleResponse{
		ID:       id,
		Title:    title,
		Content:  content,
		Category: category,
		Status:   status,
	}
}

