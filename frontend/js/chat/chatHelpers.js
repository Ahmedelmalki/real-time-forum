
export function displayMessage(data) {
  // console.log('something');
  
  const messages = document.querySelector("#messages");
  const messageCard = document.createElement("div");
  messageCard.id = "msg-received";
  messageCard.className = "message";

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.textContent = escapeHTML(data.Content);

  const messageTime = document.createElement("div");
  messageTime.className = "time-received";
  messageTime.textContent = new Date(data.Timestamp);

  messageCard.appendChild(messageContent);
  messageCard.appendChild(messageTime);
  messages.append(messageCard);
}

export function displaySentMessage(message) {
  const messages = document.querySelector("#messages");

  const messageCard = document.createElement("div");
  messageCard.id = "msg-sent";
  messageCard.className = "message";

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.textContent = escapeHTML(message.Content);

  const messageTime = document.createElement("div");
  messageTime.className = "time-sent";
  messageTime.textContent = new Date(message.Timestamp);

  messageCard.appendChild(messageContent);
  messageCard.appendChild(messageTime);
  messages.appendChild(messageCard);
}

export function createChat() {
  const app = document.querySelector("#app");
  if (!document.querySelector("#chat")) {
    const chat = document.createElement("div");
    chat.className = "chat";
    chat.id = "chat";
    chat.href = "/chat";
    chat.setAttribute("data-link", "/chat");
    app.appendChild(chat);
    chat.style.display = "none";
    
  }
}


