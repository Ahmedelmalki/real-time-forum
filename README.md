# Real-Time Forum

A real-time web forum application with private messaging capabilities built using Go, JavaScript, WebSockets, and SQLite.

## Features

### 🔐 Authentication
- User registration with comprehensive profile information (nickname, age, gender, name, email)
- Login using nickname or email + password
- Session-based authentication with secure logout

### 📝 Forum Functionality
- Create posts with categories
- Comment on posts
- Real-time feed display
- Click-to-view comments system

### 💬 Private Messaging
- **Real-time chat** between users using WebSockets
- **Online/offline status** tracking
- **Message history** with pagination (10 messages at a time)
- **Smart user list** organized by last message or alphabetically
- **Instant notifications** for new messages
- Message format includes timestamp and sender identification

### 🌐 Single Page Application
- Dynamic page routing with JavaScript
- No page refreshes - seamless user experience
- Protected routes for authenticated users

## Tech Stack

- **Backend**: Go with Gorilla WebSockets
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Database**: SQLite3
- **Real-time**: WebSockets for live messaging and user status

## Project Structure

```
.
├── backend
│   ├── authentication   
│   ├── handlers
│   ├── middleware
│   ├── mods
│   └── WebSocket
├── database
├── frontend
│   ├── css
│   ├── img
│   ├── index.html
│   └── js
│       ├── app
│       ├── authentication
│       ├── chat
│       ├── main.js
│       ├── routes.js
│       └── setupLayout.js
├── go.mod
├── go.sum
├── main.go
```
