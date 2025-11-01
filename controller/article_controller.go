package controller

import (
	"fmt"
	"strconv"
	"strings"
	"test-service/dto"
	"test-service/service"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type ArticleController struct {
	articleService service.ArticleService
}

// NewArticleController membuat instance ArticleController baru
func NewArticleController(articleService service.ArticleService) *ArticleController {
	return &ArticleController{
		articleService: articleService,
	}
}

// CreateArticle membuat artikel baru
func (ctrl *ArticleController) CreateArticle(c *fiber.Ctx) error {
	var req dto.CreateArticleRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	id, err := ctrl.articleService.CreateArticle(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": getValidationErrors(err),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id": id,
	})
}

// GetArticles mendapatkan semua artikel dengan pagination
func (ctrl *ArticleController) GetArticles(c *fiber.Ctx) error {
	limitStr := c.Params("limit")
	offsetStr := c.Params("offset")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	articles, err := ctrl.articleService.GetArticles(limit, offset)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch articles",
		})
	}

	return c.JSON(articles)
}

// GetArticleByID mendapatkan artikel berdasarkan ID
func (ctrl *ArticleController) GetArticleByID(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid article ID",
		})
	}

	article, err := ctrl.articleService.GetArticleByID(id)
	if err != nil {
		if err.Error() == "article not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch article",
		})
	}

	return c.JSON(article)
}

// UpdateArticle memperbarui artikel berdasarkan ID
func (ctrl *ArticleController) UpdateArticle(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid article ID",
		})
	}

	var req dto.UpdateArticleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if err := ctrl.articleService.UpdateArticle(id, &req); err != nil {
		if err.Error() == "article not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": getValidationErrors(err),
		})
	}

	return c.JSON(fiber.Map{})
}

// DeleteArticle menghapus artikel berdasarkan ID
func (ctrl *ArticleController) DeleteArticle(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid article ID",
		})
	}

	if err := ctrl.articleService.DeleteArticle(id); err != nil {
		if err.Error() == "article not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete article",
		})
	}

	return c.JSON(fiber.Map{})
}

// getValidationErrors mengubah error validasi menjadi string yang mudah dibaca
func getValidationErrors(err error) string {
	var errors []string
	
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrors {
			switch e.Tag() {
			case "required":
				errors = append(errors, fmt.Sprintf("%s is required", e.Field()))
			case "min":
				errors = append(errors, fmt.Sprintf("%s must be at least %s characters", e.Field(), e.Param()))
			case "oneof":
				errors = append(errors, fmt.Sprintf("%s must be one of: %s", e.Field(), e.Param()))
			default:
				errors = append(errors, fmt.Sprintf("%s is invalid", e.Field()))
			}
		}
	} else {
		return err.Error()
	}
	
	return strings.Join(errors, "; ")
}

