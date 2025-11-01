package service

import (
	"errors"
	"test-service/dto"
	"test-service/model"
	"test-service/repository"

	"gorm.io/gorm"
)

// ArticleService interface untuk business logic artikel
type ArticleService interface {
	CreateArticle(req *dto.CreateArticleRequest) (int, error)
	GetArticleByID(id int) (*dto.ArticleResponse, error)
	GetArticles(limit, offset int) ([]*dto.ArticleResponse, error)
	UpdateArticle(id int, req *dto.UpdateArticleRequest) error
	DeleteArticle(id int) error
}

type articleService struct {
	articleRepo repository.ArticleRepository
}

// NewArticleService membuat instance ArticleService baru
func NewArticleService(articleRepo repository.ArticleRepository) ArticleService {
	return &articleService{
		articleRepo: articleRepo,
	}
}

// CreateArticle membuat artikel baru
func (s *articleService) CreateArticle(req *dto.CreateArticleRequest) (int, error) {
	if err := req.Validate(); err != nil {
		return 0, err
	}

	post := &model.Post{
		Title:    req.Title,
		Content:  req.Content,
		Category: req.Category,
		Status:   req.Status,
	}

	if err := s.articleRepo.Create(post); err != nil {
		return 0, err
	}

	return post.ID, nil
}

// GetArticleByID mendapatkan artikel berdasarkan ID
func (s *articleService) GetArticleByID(id int) (*dto.ArticleResponse, error) {
	post, err := s.articleRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("article not found")
		}
		return nil, err
	}

	return dto.ToResponse(post.ID, post.Title, post.Content, post.Category, post.Status), nil
}

// GetArticles mendapatkan semua artikel dengan pagination
func (s *articleService) GetArticles(limit, offset int) ([]*dto.ArticleResponse, error) {
	posts, err := s.articleRepo.FindAll(limit, offset)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.ArticleResponse, len(posts))
	for i := range posts {
		responses[i] = dto.ToResponse(posts[i].ID, posts[i].Title, posts[i].Content, posts[i].Category, posts[i].Status)
	}

	return responses, nil
}

// UpdateArticle memperbarui artikel berdasarkan ID
func (s *articleService) UpdateArticle(id int, req *dto.UpdateArticleRequest) error {
	if err := req.Validate(); err != nil {
		return err
	}

	post, err := s.articleRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("article not found")
		}
		return err
	}

	if req.Title != "" {
		post.Title = req.Title
	}
	if req.Content != "" {
		post.Content = req.Content
	}
	if req.Category != "" {
		post.Category = req.Category
	}
	if req.Status != "" {
		post.Status = req.Status
	}

	return s.articleRepo.Update(post)
}

// DeleteArticle menghapus artikel berdasarkan ID
func (s *articleService) DeleteArticle(id int) error {
	_, err := s.articleRepo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("article not found")
		}
		return err
	}

	return s.articleRepo.Delete(id)
}

