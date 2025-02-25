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
	fmt.Println("fetching chat")
	if lastid == 0 {
		query := `SELECT id FROM chat ORDER BY id DESC LIMIT 1;`
		err := db.QueryRow(query).Scan(&lastid)
		if err != nil {
			return nil, fmt.Errorf("query error: %v", err)
		}
		lastid++
	}
	/*
		query is a SQL query string that retrieves the chat history between two users from the database.
		It selects the chat content, sent timestamp, sender and receiver IDs, sender and receiver nicknames, and chat ID.
		The query joins the chat table with the users table twice to get the nicknames of both the sender and receiver.
		The results are filtered to include only messages exchanged between the two specified users and with chat IDs less than a given value.
		The results are ordered by chat ID in descending order and limited to the 10 most recent messages.
		Parameters:
			- sender_id: ID of the sender
			- receiver_id: ID of the receiver
			- sender_id: ID of the sender (repeated for the OR condition)
			- receiver_id: ID of the receiver (repeated for the OR condition)
			- chat_id: ID of the last chat message to start retrieving from (for pagination)
	*/
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
		fmt.Println("lastid:", lastid)
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
