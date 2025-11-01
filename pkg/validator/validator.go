package validator

import (
	"strings"

	"github.com/go-playground/validator/v10"
)

// Validator wrapper untuk validator instance
type Validator struct {
	*validator.Validate
}

// NewValidator membuat instance validator baru dengan custom validation
func NewValidator() *Validator {
	v := validator.New()

	v.RegisterValidation("oneof", ValidateOneOf)

	return &Validator{Validate: v}
}

// ValidateOneOf validasi bahwa string adalah salah satu dari nilai yang diizinkan
func ValidateOneOf(fl validator.FieldLevel) bool {
	value := fl.Field().String()
	param := fl.Param()
	
	allowedValues := strings.Split(param, " ")
	
	for _, allowed := range allowedValues {
		if strings.ToLower(value) == strings.ToLower(allowed) {
			return true
		}
	}
	
	return false
}

