
package models

import (
	"fmt"
	"log"

	"crontab/internal/config"
	
	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// SetupDatabase connects to the database and returns a DB instance
func SetupDatabase(cfg *config.Config) (*gorm.DB, error) {
	// Build connection string
	dsn := fmt.Sprintf("sqlserver://%s:%s@%s:%s?database=%s",
		cfg.GetString("DB_USERNAME", "sa"),
		cfg.GetString("DB_PASSWORD", "YourStrong@Passw0rd"),
		cfg.GetString("DB_HOST", "localhost"),
		cfg.GetString("DB_PORT", "1433"),
		cfg.GetString("DB_NAME", "crontab"))
	
	// Set logging level
	logLevel := logger.Silent
	if cfg.GetBool("DB_LOGGING", false) {
		logLevel = logger.Info
	}
	
	// Open database connection
	db, err := gorm.Open(sqlserver.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}
	
	log.Println("Connected to database successfully")
	return db, nil
}

// MigrateDatabase runs migrations for all models
func MigrateDatabase(db *gorm.DB) error {
	log.Println("Running database migrations")
	
	err := db.AutoMigrate(
		&Project{},
		&Job{},
		&JobLog{},
		&User{},
		&Role{},
	)
	
	if err != nil {
		return fmt.Errorf("failed to migrate database: %v", err)
	}
	
	log.Println("Database migrations completed successfully")
	
	// Create default roles if they don't exist
	return seedDefaultRoles(db)
}

// seedDefaultRoles creates default roles if they don't exist
func seedDefaultRoles(db *gorm.DB) error {
	roles := []struct {
		Name        string
		Permissions []string
	}{
		{
			Name:        "admin",
			Permissions: []string{"view", "create", "update", "delete", "manage_users"},
		},
		{
			Name:        "user",
			Permissions: []string{"view", "create", "update"},
		},
		{
			Name:        "viewer",
			Permissions: []string{"view"},
		},
	}
	
	for _, r := range roles {
		var count int64
		db.Model(&Role{}).Where("name = ?", r.Name).Count(&count)
		
		if count == 0 {
			permissionsJSON, err := MarshalPermissions(r.Permissions)
			if err != nil {
				return fmt.Errorf("failed to marshal permissions: %v", err)
			}
			
			role := Role{
				Name: r.Name,
				Permissions: r.Permissions,
				PermissionsJSON: permissionsJSON,
			}
			
			if err := db.Create(&role).Error; err != nil {
				return fmt.Errorf("failed to create role %s: %v", r.Name, err)
			}
			
			log.Printf("Created default role: %s", r.Name)
		}
	}
	
	return nil
}
