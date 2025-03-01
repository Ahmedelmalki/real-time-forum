import { escapeHTML } from "../app/helpers.js";
import { renderLoginForm } from "../app/login.js";
// import { isAuthenticated } from "../authentication/isAuth.js";
import { fetchHistory, Msgs, resetChatHistory } from "./chatHistory.js";
import { displaySentMessage } from "./chatHelpers.js";
import { socket } from "./webSocket.js";
import { createChat } from "./chatHelpers.js";
import { onlineUsersIds } from "./webSocket.js";

export function chatArea(nickname) {
  const chat = document.querySelector("#chat");
  chat.style.display = "block";
  document.querySelector("#container").style.display = "none";
  chat.innerHTML =/*html*/ `
        <div id="user-card">
            <div class="chat-header">
                <button class="back-btn">←</button>
                <span>${escapeHTML(nickname)}</span>
            </div>
            <div class="messages-container" id="messages">
                <!-- Messages will be inserted here -->
            </div>
            <div class="input-area">
                <input type="text" id="message-input" placeholder="Type a message...">
                <button id="send-btn">
                    <img src="/frontend/img/send.png" alt="Send" class="send-icon">
                </button>
            </div>
        </div>
    `;
  setupeventlisteners(nickname);
}

function setupeventlisteners(nickname) {
  let msgctr = document.querySelector(".messages-container");
  msgctr.addEventListener("scroll", () => {
    // Only fetch more if we're near the top and there are more messages
    if (msgctr.scrollTop < 50 && !Msgs.noMoreMessages) {
      fetchHistory(nickname);
      console.log("msg.lastid:", Msgs.lastid, "offset:", Msgs.offset);
    }
  });

  const backBtn = document.querySelector(".back-btn");
  backBtn.addEventListener("click", async () => {
    chat.style.display = "none";
    document.querySelector("#container").style.display = "block";
    await fetchUsers();
  });

  const sendBtn = document.querySelector("#send-btn");
  sendBtn.addEventListener("click", () => sendMessage(nickname));

  const input = document.querySelector("#message-input");
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage(nickname);
  });
}

 function sendMessage(nickname) {
  const sender = document.querySelector('.profileNicknime').textContent.trim();
  console.log('sender',sender);
  
  const input = document.querySelector("#message-input");
  const content = input.value.trim();
  if (!content) return;
  let message = {
    Type : "DM",
    Content: content,
    Receiver_name: nickname,
    Sender_name: sender,
    Timestamp: null,
  };
  
  socket.ws.send(JSON.stringify(message));
  displaySentMessage(   message = {
    Type : "DM",
    Content: content ,
    Receiver_name: nickname,
    Sender_name: sender,
    Timestamp: Date.now(),
  });
  input.value = "";
}

export function updateUserStatus(onlineUserIds) {
  const userCards = document.querySelectorAll(".user-card");

  userCards.forEach((card) => {
    const userId = Number(card.dataset.userId);
    const statusDot = card.querySelector(".status-dot");

    if (onlineUserIds.includes(userId)) {
      statusDot.classList.add("online");
    } else {
      statusDot.classList.remove("online");
    }
  });
}

/**************************** displaying the users ****************************/
export async function fetchUsers() {
  createChat();
  try {
    const res = await fetch("/users");
    if (!res.ok) {
      if (res.status === 401) {
        renderLoginForm();
        return;
      }
      throw new Error("Failed to fetch users");
    }
    const users = await res.json();
    document.querySelector("#chat").replaceChildren();
    displayUsers(users);
  } catch (error) {
    console.error(error);
  }
}

function displayUsers(users) {
  createUsresContainer();
  const chat = document.querySelector("#usres-container");
  chat.innerHTML = "";
  users.forEach((user) => {
    const userCard = createUserCard(user);
    userCard.addEventListener("click", () => {
      resetChatHistory();
      chatArea(user.Nickname);      
      fetchHistory(user.Nickname);
    });
    chat.appendChild(userCard);
  });
}

/************************* helper functions **********************************/
function createUserCard(user) {
  const userCard = document.createElement("div");
  userCard.className = "user-card";
  userCard.dataset.userId = user.Id;

  const profile = document.createElement("div"); // profile picture
  profile.className = "profile";
  profile.innerText = `${user.FirstName[0]}${user.LastName[0]}`;

  const nickname = document.createElement("div"); // user nickname
  nickname.className = "nickname";
  nickname.innerText = `${user.Nickname}`;

  const statusDot = document.createElement("div");
  statusDot.className = "status-dot";
  if (onlineUsersIds.includes(Number(user.Id))) {
    statusDot.classList.add("online");
  }

  profile.appendChild(statusDot);
  userCard.appendChild(profile);
  userCard.appendChild(nickname);

  return userCard;
}

function createUsresContainer() {
  if (!document.querySelector("#usres-container")) {
    const app = document.querySelector("#app");
    const usersContainer = document.createElement("div");
    usersContainer.id = "usres-container";
    usersContainer.className = 'notloged';
    app.appendChild(usersContainer);
  }
}

