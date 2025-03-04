package main

import (
	"fmt"
	"log"
	"net/http"

	websoc "real-time-forum/backend/WebSocket"
	"real-time-forum/backend/authentication"
	forum "real-time-forum/backend/handlers"
	"real-time-forum/database"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	mux := http.NewServeMux()
	db := database.InitDB()
	defer db.Close()

	hub := websoc.NewHub()
	go hub.Run()
	mux.Handle("/frontend/", http.StripPrefix("/frontend/", http.FileServer(http.Dir("./frontend"))))
	
	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		websoc.HandleConnections(hub, db)(w, r)
	})

	mux.HandleFunc("/dm", func(w http.ResponseWriter, r *http.Request) {
		websoc.ChatAPIHandler(db)(w, r)
	})

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./frontend/index.html")
	})


	mux.HandleFunc("/posts", func(w http.ResponseWriter, r *http.Request) {
		forum.APIHandler(db)(w, r)
	})

	mux.HandleFunc("/register", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			forum.RegisterHandler(db, w, r)
		} else {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/newPost", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			forum.NewPostHandler(db)(w, r)
		} else {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
		forum.LogOutHandler(db)(w, r)
		// if r.Method == http.MethodPost {
		// } else {
		// 	http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		// }
	})

	mux.HandleFunc("/api/login", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			forum.LoginHandler(db)(w, r)
		} else {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/comments", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			forum.CreateComment(db)(w, r)
		} else if r.Method == http.MethodGet {
			forum.GetComments(db)(w, r)
		} else {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		}
	})

	// displaying users
	mux.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
		forum.DisplayUsersHandler(db)(w, r)
	})

	mux.HandleFunc("/user_id", func(w http.ResponseWriter, r *http.Request) {
		authentication.HandleAuthentication(db)(w, r)
	})

	mux.HandleFunc("/profile", func(w http.ResponseWriter, r *http.Request) {
		forum.ProfileApi(db)(w, r)
	})

	fmt.Println("Server is running on http://localhost:4011")
	log.Fatal(http.ListenAndServe(":4011", mux))
}
