package config

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
)

type Redis struct {
	Client *redis.Client
	Ctx    context.Context
}

// InitRedis membuat koneksi ke Redis
func InitRedis() (*Redis, error) {
	host := os.Getenv("REDIS_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("REDIS_PORT")
	if port == "" {
		port = "6379"
	}

	password := os.Getenv("REDIS_PASSWORD")
	if password == "" {
		password = ""
	}

	db := 0
	if dbStr := os.Getenv("REDIS_DB"); dbStr != "" {
		fmt.Sscanf(dbStr, "%d", &db)
	}

	client := redis.NewClient(&redis.Options{
		Addr:         fmt.Sprintf("%s:%s", host, port),
		Password:     password,
		DB:           db,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
	})

	ctx := context.Background()

	_, err := client.Ping(ctx).Result()
	if err != nil {
		return nil, err
	}

	return &Redis{
		Client: client,
		Ctx:    ctx,
	}, nil
}

// Close menutup koneksi Redis
func (r *Redis) Close() error {
	return r.Client.Close()
}
