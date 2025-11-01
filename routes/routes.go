package routes

import (
	"test-service/controller"

	"github.com/gofiber/fiber/v2"
)

// SetupRoutes mengatur semua route aplikasi
func SetupRoutes(app *fiber.App, articleController *controller.ArticleController) {
	api := app.Group("/article")
	api.Post("/", articleController.CreateArticle)
	api.Get("/:limit/:offset", articleController.GetArticles)
	api.Get("/:id", articleController.GetArticleByID)
	api.Put("/:id", articleController.UpdateArticle)
	api.Patch("/:id", articleController.UpdateArticle)
	api.Delete("/:id", articleController.DeleteArticle)
}

