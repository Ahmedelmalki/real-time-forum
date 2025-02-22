import { handleRoute } from "../main.js";
import { socket } from "../chat/webSocket.js"; 
export async function renderLogout() {
  document.querySelector("#button-group").remove();
  document.querySelector("#forum").remove();
  const res = await fetch("/logout", {
    method: "POST",
    credentials: "same-origin",
  });
  if (res.ok) {
    socket.close();
    history.pushState(null, null, "/login");
    await handleRoute();
  } else {
    let data = await res.text();
    alert(data);
  }
}
