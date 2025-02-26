import { updateUserStatus } from "./chatArea.js";
import { displayMessage } from "./chatHelpers.js";
export let onlineUsersIds = [];

export const socket = {
  ws: null,
  init() {
    this.ws = new WebSocket(`ws://${document.location.host}/ws`);
    this.ws.onopen = this.onOpen;
    this.ws.onclose = this.onClose;
    this.ws.onmessage = this.onMessage;
    this.ws.onerror = this.onError;
  },
  onOpen(event) {
    console.log("WebSocket connection opened:", event);
  },
  onClose(event) {
    console.log("WebSocket connection closed:", event.code, event.reason);
  },
  onMessage(event) {
    try {
      const msgContainer = document.querySelector(".messages-container");
      const newdata = JSON.parse(event.data);
      if (newdata.type === "users-status") {
        onlineUsersIds = newdata.users;
        updateUserStatus(newdata.users);
      } else if (msgContainer) {
        displayMessage(newdata);
      } else {
      //show notification
      }
    } catch (err) {
      console.error("Error parsing message:", err);
    }
  },
  onError(event) {
    console.error("WebSocket error:", event);
  },
  close() {
    this.ws.close();
  },
};
socket.init();
