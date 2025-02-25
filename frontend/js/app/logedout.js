import { handleRoute } from "../main.js";
import { socket } from "../chat/webSocket.js"; 
export async function renderLogout() {
  document.querySelector("#button-group").remove();
  let e = document.querySelector("#usres-container")
  if (e) e.remove();
  document.querySelector("#forum").remove();
  const res = await fetch("/logout", {
    method: "POST",
    credentials: "same-origin",
  });
  if (res.ok) {
    history.pushState(null, null, "/login");    
    await handleRoute();
    socket.ws.close();
  } else {
    let data = await res.text();
    alert(data);
  }
}
