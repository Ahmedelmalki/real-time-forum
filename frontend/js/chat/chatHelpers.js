
export function displayMessage(data) {  
  const messages = document.querySelector("#messages");
  
  const messageCard = document.createElement("div");
  messageCard.id = "msg-received";
  messageCard.className = "message";

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.textContent = escapeHTML(data.Content);

  const messageTime = document.createElement("div");
  messageTime.className = "time-received";
  messageTime.classList.add("message-time");
  const date = new Date(data.Timestamp);

  messageTime.textContent = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  const messageWrapper = document.createElement("div");
  messageWrapper.className = "message-wrapper";
  messageWrapper.appendChild(messageContent);
  messageWrapper.appendChild(messageTime);
  // messageCard.appendChild(messageTime);
  // messageCard.appendChild(messageContent);
  messages.append(messageWrapper);
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
  messageTime.classList.add("message-time");
  const date = new Date(message.Timestamp);
  messageTime.textContent = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  const messageWrapper = document.createElement("div");
  messageWrapper.className = "message-wrapper";
  messageWrapper.appendChild(messageContent);
  messageWrapper.appendChild(messageTime);

  // messageCard.appendChild(messageTime);
  // messageCard.appendChild(messageContent);
  messages.appendChild(messageWrapper);
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

/******************** notification logic *********************/
export function showNotification(sender){
  clearNotification();
  const app = document.querySelector('#app')
  const notif = document.createElement("div");
  notif.className = 'notification';
  notif.textContent = `you have a message from ${sender}`
  const x = document.createElement("span");
  x.className = "close";
  x.textContent = "x";
  x.onclick = function(){
    notif.remove();
  }
  notif.appendChild(x);
  app.append(notif)
}


function clearNotification(){
  setTimeout(() => {
    document.querySelectorAll('.notification').forEach(n =>{
     n.remove();
    })
   }, 5000);
}

