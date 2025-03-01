package forum

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"real-time-forum/backend/authentication"
	modles "real-time-forum/backend/mods"
)

func getProfile(db *sql.DB, r *http.Request) (modles.User, error) {
	var user modles.User
	userId := authentication.IsLoged(db, r)
	user.ID = userId
	query := `
		SELECT
			u.nickname,
			u.firstName,
			u.lastName
		FROM users u
		WHERE u.id = ?;
	`
	err := db.QueryRow(query, userId).Scan(&user.Nickname, &user.FirstName, &user.LastName)
	if err != nil {
		fmt.Println("error :\n", err)
		return modles.User{}, err
	}
	return user, nil
}

func ProfileApi(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user, err := getProfile(db, r)
		if err != nil {
			fmt.Println(err)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-cache")
		json.NewEncoder(w).Encode(user)
	}
}