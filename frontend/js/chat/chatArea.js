import { escapeHTML } from "../app/helpers.js";
import { isAuthenticated } from "../authentication/isAuth.js";
import { fetchHistory, Msgs } from "./chatHistory.js";
import { displaySentMessage } from "./chatHelpers.js";
import { socket } from "./webSocket.js";
import { createChat } from "./chatHelpers.js";
import { onlineUsersIds } from "./webSocket.js";

export function chatArea(nickname) {
  const chat = document.querySelector("#chat");
  chat.style.display = "block";
  document.querySelector("#container").style.display = "none";
  chat.innerHTML = `
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
    if (msgctr.scrollTop < 50 && !Msgs.noMoreMessages) {
      fetchHistory(nickname);
      console.log('msg.lastid:',Msgs.lastid);
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

async function sendMessage(nickname) {
  const input = document.querySelector("#message-input");
  const content = input.value.trim();
  const sender_id = await isAuthenticated();
  if (!content) return;
  const message = {
    Content: content,
    Sender_id: sender_id,
    Receiver_name: nickname,
    Timestamp: new Date(),
  };
  displaySentMessage(message);
  socket.ws.send(JSON.stringify(message));
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
  // console.log({ socket });
  createChat();
  try {
    const res = await fetch("/users");
    if (!res.ok) {
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
    // 
    const userCard = createUserCard(user);
    // click on user to display chat area
    userCard.addEventListener("click", () => {
      chatArea(user.Nickname);
      fetchHistory(user.Nickname);
    });
    chat.appendChild(userCard);
  });
}

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
    app.appendChild(usersContainer);
  }
}
