// // import { debounce } from "../app/helpers.js";
// import { chatArea } from "./chatArea.js";
// import { createChat } from "./chatHelpers.js";

// export async function fetchUsers(onlineUsersIds) {
//   createChat();
//   try {
//     const res = await fetch("/users");
//     if (!res.ok) {
//       throw new Error("Failed to fetch users");
//     }
//     const users = await res.json();
//     document.querySelector("#chat").replaceChildren();
//     displayUsers(users, onlineUsersIds);
//     // debounce displaying the users to not spam the document
//     // const debouncedDisplay = debounce((users) => {
//     //   displayUsers(users, onlineUsersIds);
//     // }, 300);

//     // document.addEventListener("scroll", () => {
//     //   debouncedDisplay(users);
//     // });
//   } catch (error) {
//     console.error(error);
//   }
// }

// function displayUsers(users, onlineUsersIds) {
//   const chat = document.querySelector("#chat");
//   for (let i = 0; i < 30; i++) {
//     const user = users.shift();
//     if (user) {
//       const userCard = document.createElement("div");
//       userCard.className = "user-card";
//       userCard.dataset.userId = user.Id;

//       const profile = document.createElement("div");
//       profile.className = "profile";
//       profile.innerText = `${user.FirstName[0]}${user.LastName[0]}`;

//       //online
//       const statusDot = document.createElement("div");
//       statusDot.className = "status-dot";
//       if (onlineUsersIds.includes(Number(user.Id))) {
//         statusDot.classList.add("online");
//       }
      
//       const nickname = document.createElement("div");
//       nickname.className = "nickname";
//       nickname.innerText = `${user.Nickname}`;
      
//       profile.appendChild(statusDot);
//       userCard.appendChild(profile);
//       userCard.appendChild(nickname);

//       // click on user to display chat area
//       userCard.addEventListener("click", () => {
//         chatArea(user.Nickname);
//       });
//       chat.appendChild(userCard);
//     }
//   }
// }

