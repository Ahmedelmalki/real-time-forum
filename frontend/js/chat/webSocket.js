import { updateUserStatus} from './chatArea.js';
import {displayMessage} from './chatHelpers.js';
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
        // console.log("WebSocket message received:", event.data);
        try {
            const newdata = JSON.parse(event.data);
            if (newdata.type === "users-status") {
              onlineUsersIds = newdata.users;
              // console.log('onlineUsersIds :',onlineUsersIds);
              
              updateUserStatus(newdata.users);
            } else {
              displayMessage(newdata);
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
    }                   

}
//new WebSocket(`ws://${document.location.host}/ws`);
socket.init();