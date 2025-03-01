import { createMessage } from "./chatHistory.js";

export function displayMessage(data, currentUserId) {
  const messages = document.querySelector("#messages");
  createMessage(data, {
    currentUserId: currentUserId,
    includeSender: false,
    timeFormat: 'time',  // Show formatted time
    useWrapper: true,    // Use content wrapper
    appendTo: messages
  });
}
export function displaySentMessage(message, currentUserId) {
  const messages = document.querySelector("#messages");
  createMessage(message, {
    currentUserId: currentUserId,
    includeSender: false,
    timeFormat: 'time',  // Show formatted time
    useWrapper: true,    // Use content wrapper
    appendTo: messages
  });
}

export function createChat() { // make this element unscrollable AAAAAAAAAAAAAAAAAAAAAAA
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
  x.textContent = "X";
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

