package repository

import (
	"errors"
	"test-service/model"

	"gorm.io/gorm"
)

// ArticleRepository interface untuk data access artikel
type ArticleRepository interface {
	Create(post *model.Post) error
	FindByID(id int) (*model.Post, error)
	FindAll(limit, offset int) ([]*model.Post, error)
	Update(post *model.Post) error
	Delete(id int) error
}

type articleRepository struct {
	db *gorm.DB
}

// NewArticleRepository membuat instance ArticleRepository baru
func NewArticleRepository(db *gorm.DB) ArticleRepository {
	return &articleRepository{db: db}
}

// Create membuat artikel baru di database
func (r *articleRepository) Create(post *model.Post) error {
	return r.db.Create(post).Error
}

// FindByID mencari artikel berdasarkan ID
func (r *articleRepository) FindByID(id int) (*model.Post, error) {
	var post model.Post
	if err := r.db.First(&post, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	return &post, nil
}

// FindAll mendapatkan semua artikel dengan pagination
func (r *articleRepository) FindAll(limit, offset int) ([]*model.Post, error) {
	var posts []model.Post
	if err := r.db.Order("created_date DESC").Limit(limit).Offset(offset).Find(&posts).Error; err != nil {
		return nil, err
	}

	result := make([]*model.Post, len(posts))
	for i := range posts {
		result[i] = &posts[i]
	}
	return result, nil
}

// Update memperbarui artikel di database
func (r *articleRepository) Update(post *model.Post) error {
	updates := map[string]interface{}{
		"title":    post.Title,
		"content":  post.Content,
		"category": post.Category,
		"status":   post.Status,
	}
	return r.db.Model(&model.Post{}).Where("id = ?", post.ID).Updates(updates).Error
}

// Delete menghapus artikel dari database
func (r *articleRepository) Delete(id int) error {
	return r.db.Delete(&model.Post{}, id).Error
}

