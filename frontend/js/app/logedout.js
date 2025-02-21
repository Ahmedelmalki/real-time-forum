import { handleRoute } from "../main.js";
export async function renderLogout() {
      
  document.querySelector("#button-group").remove();
  document.querySelector("#forum").remove();
  const res = await fetch("/logout", {
    method: "POST",
    credentials: "same-origin",
  });  
  if (res.ok) {
    history.pushState(null, null, "/login");
    await handleRoute();
  }
  let data = await res.text();
  alert(data);
}
