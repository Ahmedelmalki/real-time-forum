package websoc

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"real-time-forum/backend/authentication"
	modles "real-time-forum/backend/mods"
	"slices"
	"sync"

	"github.com/gorilla/websocket"
)

type ConnectionManager struct {
	Clients    map[*Client]bool
	Register   chan *Client
	Unregister chan *Client
	Send       chan modles.Message
	Mu         sync.Mutex
	// tracks online status by userID
	OnlineUsers   map[int]bool
	OnlineClients map[int][]*Client
}

type Client struct {
	hub    *ConnectionManager
	conn   *websocket.Conn
	userID int
}

var Upgrader = websocket.Upgrader{
	// If the CheckOrigin field is nil, then the Upgrader uses a safe default:
	// fail the handshake if the Origin request header is present and the
	// Origin host is not equal to the Host request header.
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func NewHub() *ConnectionManager {
	return &ConnectionManager{
		Register:      make(chan *Client),
		Unregister:    make(chan *Client),
		Clients:       make(map[*Client]bool),
		Send:          make(chan modles.Message, 4096),
		OnlineUsers:   make(map[int]bool),
		OnlineClients: make(map[int][]*Client),
	}
}

func HandleConnections(hub *ConnectionManager, db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := authentication.IsLoged(db, r)
		if userID == 0 {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		conn, err := Upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Println("error upgrading to ws:\n", err)
			return
		}

		client := &Client{
			hub:    hub,
			conn:   conn,
			userID: userID,
		}

		/*This doesn’t immediately add the client to the hub
		Instead, it sends a request to the hub's Run() method
		which is constantly listening for such events
		*/
		client.hub.Register <- client

		defer func() {
			hub.Unregister <- client
		}()
		for {
			_, mssg, err := conn.ReadMessage()
			if err != nil {
				fmt.Println(err)
				return
			}
			var msg modles.Message
			if err := json.Unmarshal(mssg, &msg); err != nil {
				continue
			}
			db.QueryRow(`SELECT id FROM users WHERE nickname = ? `, msg.ReceiverName).Scan(&msg.ReceiverID)
			db.Exec(`
					INSERT INTO chat (content, sender_id, receiver_id)
					VALUES (?, ?, ?)
        	`, msg.Content, msg.SenderID, msg.ReceiverID)

			hub.Mu.Lock()
			// Queues the message to be sent to the right user
			hub.Send <- msg
			hub.Mu.Unlock()
		}
	}
}

func (h *ConnectionManager) Run() {
	for {
		select {
		case client := <-h.Register:
			fmt.Println(&client, "register")
			h.Mu.Lock()
			/* status update */
			h.Clients[client] = true
			h.OnlineUsers[client.userID] = true
			h.OnlineClients[client.userID] = append(h.OnlineClients[client.userID], client)

			for userID := range h.OnlineUsers {
				statusUpdate := modles.StatusUpdate{
					UserID: userID,
					Status: "online",
				}
				client.conn.WriteJSON(statusUpdate)
			}

			statusUpdate := modles.StatusUpdate{
				UserID: client.userID,
				Status: "online",
			}
			for c := range h.Clients {
				c.conn.WriteJSON(statusUpdate)
			}
			h.Mu.Unlock()
		case client := <-h.Unregister:
			fmt.Println(client, "Unregister")
			h.Mu.Lock()
			if _, ok := h.Clients[client]; ok {
				delete(h.Clients, client)

				clients := h.OnlineClients[client.userID]
				for i, c := range clients {
					if c == client {
						h.OnlineClients[client.userID] = slices.Delete(clients, i, i+1)
						break
					}
				}
				if len(h.OnlineClients[client.userID]) == 0 {
					delete(h.OnlineUsers, client.userID)

					statusUpdate := modles.StatusUpdate{
						UserID: client.userID,
						Status: "offline",
					}
					for c := range h.Clients {
						c.conn.WriteJSON(statusUpdate)
						fmt.Println("########", statusUpdate)
					}
				}
			}
			h.Mu.Unlock()
		case message := <-h.Send: // Picks up the message and delivers it
			h.Mu.Lock()
			for client := range h.Clients {
				if client.userID == message.ReceiverID {
					err := client.conn.WriteJSON(message)
					if err != nil {
						client.conn.Close()
						delete(h.Clients, client)
						fmt.Println(err)
						return
					}
				}
			}
			h.Mu.Unlock()
		}
	}
}
