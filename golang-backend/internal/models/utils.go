
package models

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
)

// generateUUID generates a pseudo-UUID
func generateUUID() string {
	bytes := make([]byte, 16)
	_, err := rand.Read(bytes)
	if err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	
	return hex.EncodeToString(bytes)
}

// MarshalPermissions converts a string slice to JSON string
func MarshalPermissions(permissions []string) (string, error) {
	if len(permissions) == 0 {
		return "[]", nil
	}
	
	data, err := json.Marshal(permissions)
	if err != nil {
		return "", err
	}
	
	return string(data), nil
}

// UnmarshalPermissions converts a JSON string to string slice
func UnmarshalPermissions(data string) ([]string, error) {
	if data == "" {
		return []string{}, nil
	}
	
	var permissions []string
	err := json.Unmarshal([]byte(data), &permissions)
	if err != nil {
		return []string{}, err
	}
	
	return permissions, nil
}
