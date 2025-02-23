import { escapeHTML } from "../app/helpers.js";
import { isAuthenticated } from "../authentication/isAuth.js";
import { fetchHistory } from "./chatHistory.js";
// import { fetchUsers } from "./displayUsers.js";
import { displayMessage, displaySentMessage } from "./chatHelpers.js";
import { socket } from "./webSocket.js";
import { createChat } from "./chatHelpers.js";
let onlineUsersIds = [];


socket.addEventListener("error", (error) => {
  console.error("WebSocket error:", error);
});

socket.addEventListener("close", (event) => {
  console.log("WebSocket connection closed:", event.code, event.reason);
});

socket.onmessage = (eve) => {
  try {
    const newdata = JSON.parse(eve.data);
    if (newdata.type === "users-status") {
      onlineUsersIds = newdata.users;
      console.log('onlineUsersIds :',onlineUsersIds);
      
      updateUserStatus(newdata.users);
    } else {
      displayMessage(newdata);
    }
  } catch (err) {
    console.error("Error parsing message:", err);
  }
};

export function chatArea(nickname) {
  const chat = document.querySelector("#chat");
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

  // later
  //chat.addEventListener("click", () => {
    fetchHistory(nickname);
  //});

  document.querySelector(".back-btn").addEventListener("click", async () => {
   await fetchUsers();
  });

  document
    .querySelector("#send-btn")
    .addEventListener("click", () => sendMessage(nickname));
  document.querySelector("#message-input").addEventListener("keypress", (e) => {
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
  socket.send(JSON.stringify(message));
  input.value = "";
}

function updateUserStatus(onlineUserIds) {
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
      throw new Error("Failed to fetch users");
    }
    const users = await res.json();
    document.querySelector("#chat").replaceChildren();
    displayUsers(users);
    // debounce displaying the users to not spam the document
    // const debouncedDisplay = debounce((users) => {
    //   displayUsers(users, onlineUsersIds);
    // }, 300);

    // document.addEventListener("scroll", () => {
    //   debouncedDisplay(users);
    // });
  } catch (error) {
    console.error(error);
  }
}

function displayUsers(users) {
  const chat = document.querySelector("#chat");
  for (let i = 0; i < 30; i++) {
    const user = users.shift();
    if (user) {
      const userCard = document.createElement("div");
      userCard.className = "user-card";
      userCard.dataset.userId = user.Id;

      const profile = document.createElement("div");
      profile.className = "profile";
      profile.innerText = `${user.FirstName[0]}${user.LastName[0]}`;

      //online
      const statusDot = document.createElement("div");
      statusDot.className = "status-dot";
      if (onlineUsersIds.includes(Number(user.Id))) {
        statusDot.classList.add("online");
      }
      
      const nickname = document.createElement("div");
      nickname.className = "nickname";
      nickname.innerText = `${user.Nickname}`;
      
      profile.appendChild(statusDot);
      userCard.appendChild(profile);
      userCard.appendChild(nickname);

      // click on user to display chat area
      userCard.addEventListener("click", () => {
        chatArea(user.Nickname);
      });
      chat.appendChild(userCard);
    }
  }
}