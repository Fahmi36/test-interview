package main

import (
	"log"
	"os"

	"test-service/config"
	"test-service/controller"
	"test-service/repository"
	"test-service/routes"
	"test-service/service"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	db, err := config.InitDatabase()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Running database migrations...")
	if err := db.Migrate(); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}
	log.Println("Database migrations completed successfully")

	redis, err := config.InitRedis()
	if err != nil {
		log.Println("Redis connection failed (optional):", err)
		redis = nil
	} else {
		log.Println("Redis connected successfully")
		defer redis.Close()
	}

	articleRepo := repository.NewArticleRepository(db.DB)

	articleService := service.NewArticleService(articleRepo)

	articleController := controller.NewArticleController(articleService)

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	app.Use(recover.New())
	app.Use(requestid.New())
	app.Use(cors.New())
	app.Use(logger.New())

	routes.SetupRoutes(app, articleController)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Server starting on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
