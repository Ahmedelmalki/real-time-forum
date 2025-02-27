package websoc

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"real-time-forum/backend/authentication"
	modles "real-time-forum/backend/mods"
	"strconv"
)

func fetchChat(db *sql.DB, senedr, reciever, lastid int) ([]modles.Message, error) {
	if lastid == 0 {
		query := `SELECT id FROM chat ORDER BY id DESC LIMIT 1;`
		err := db.QueryRow(query).Scan(&lastid)
		if err != nil {
			return nil, fmt.Errorf("query error: %v", err)
		}
		lastid++
	}
	query := `
		SELECT 
			chat.content,
			chat.sent_at,
			chat.sender_id,
			sender.nickname AS sender_name,
			chat.receiver_id,
			receiver.nickname AS receiver_name,
			chat.id
		FROM chat
		JOIN users AS sender ON chat.sender_id = sender.id
		JOIN users AS receiver ON chat.receiver_id = receiver.id
		WHERE
			((chat.sender_id = ? AND chat.receiver_id = ?) OR
			(chat.sender_id = ? AND chat.receiver_id = ?))
		AND 
			chat.id < ?
		ORDER BY chat.id DESC
		LIMIT 10;
	`
	rows, err := db.Query(query, senedr, reciever, reciever, senedr, lastid)
	if err != nil {
		return nil, fmt.Errorf("query error: %v", err)
	}
	defer rows.Close()

	var chat []modles.Message
	for rows.Next() {
		var msg modles.Message
		err = rows.Scan(
			&msg.Content,
			&msg.Timestamp,
			&msg.SenderID,
			&msg.SenderName,
			&msg.ReceiverID,
			&msg.ReceiverName,
			&msg.ID,
		)
		if err != nil {
			fmt.Printf("error scanning: %v\n", err)
			continue
		}
		chat = append(chat, msg)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("row iteration error: %v", err)
	}
	// for i := range chat {
	// 	fmt.Println(chat[i].Content)
	// }

	return chat, nil
}

func ChatAPIHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId := authentication.IsLoged(db, r)
		if userId == 0 {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		receiverNickname := r.URL.Query().Get("receiver")
		fmt.Println("receiver:", receiverNickname)
		lastid, err1 := strconv.Atoi(r.URL.Query().Get("lastid"))
		if err1 != nil {
			lastid = 0
		}
		if receiverNickname == "" {
			http.Error(w, "receiver not specified", http.StatusBadRequest)
			return
		}
		var reciever_id int
		err := db.QueryRow(`SELECT id FROM users WHERE nickname = ?`, receiverNickname).Scan(&reciever_id)
		if err != nil {
			fmt.Println("error selecting from users:", err)
			return
		}

		chat, err := fetchChat(db, userId, reciever_id, lastid)
		if err != nil {
			fmt.Println(err)
			http.Error(w, "error fetching chat", 500)
			return
		}
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(chat); err != nil {
			http.Error(w, "error encoding response", http.StatusInternalServerError)
		}

	}
}
