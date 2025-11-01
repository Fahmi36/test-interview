package model

import (
	"time"
)

// Post model untuk tabel posts
type Post struct {
	ID          int       `gorm:"primaryKey;autoIncrement" json:"id"`
	Title       string    `gorm:"type:varchar(200);not null" json:"title"`
	Content     string    `gorm:"type:text;not null" json:"content"`
	Category    string    `gorm:"type:varchar(100);not null" json:"category"`
	Status      string    `gorm:"type:varchar(100);not null" json:"status"`
	CreatedDate time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"created_date"`
	UpdatedDate time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" json:"updated_date"`
}

// TableName menentukan nama tabel untuk model Post
func (Post) TableName() string {
	return "posts"
}

