package middleware

import (
	"context"
	"database/sql"
	"net/http"
	"real-time-forum/backend/authentication"
)

type contextKey string

const userIDKey = contextKey("userID")

// AuthMiddleware wraps an http.Handler and checks if the user is logged in.
// AuthMiddleware is a middleware function that checks if a user is authenticated.
// It takes a database connection and the next handler in the chain as parameters.
// If the user is not authenticated, it responds with an "Unauthorized" status.
// If the user is authenticated, it adds the user ID to the request context and
// calls the next handler in the chain.
//
// Parameters:
//   - db: A database connection used to check the user's authentication status.
//   - next: The next HTTP handler to be called if the user is authenticated.
//
// Returns:
//   An HTTP handler that performs the authentication check and either responds
//   with an "Unauthorized" status or calls the next handler with the user ID
//   added to the request context.
func AuthMiddleware(db *sql.DB, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := authentication.IsLoged(db, r)
		if userID == 0 {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		// Add userID to the context so downstream handlers can access it.
		ctx := context.WithValue(r.Context(), userIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
