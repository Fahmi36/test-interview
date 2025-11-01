package dto

import (
	"strings"
	"test-service/pkg/validator"
)

// CreateArticleRequest request payload untuk membuat artikel
type CreateArticleRequest struct {
	Title    string `json:"title" validate:"required,min=20"`
	Content  string `json:"content" validate:"required,min=200"`
	Category string `json:"category" validate:"required,min=3"`
	Status   string `json:"status" validate:"required,oneof=publish draft thrash"`
}

// UpdateArticleRequest request payload untuk memperbarui artikel
type UpdateArticleRequest struct {
	Title    string `json:"title" validate:"omitempty,min=20"`
	Content  string `json:"content" validate:"omitempty,min=200"`
	Category string `json:"category" validate:"omitempty,min=3"`
	Status   string `json:"status" validate:"omitempty,oneof=publish draft thrash"`
}

// Validate validasi request CreateArticleRequest
func (r *CreateArticleRequest) Validate() error {
	v := validator.NewValidator()

	r.Status = strings.ToLower(strings.TrimSpace(r.Status))

	return v.Struct(r)
}

// Validate validasi request UpdateArticleRequest
func (r *UpdateArticleRequest) Validate() error {
	v := validator.NewValidator()

	if r.Status != "" {
		r.Status = strings.ToLower(strings.TrimSpace(r.Status))
	}

	return v.Struct(r)
}

