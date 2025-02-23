//  import { debounce } from "../app/helpers.js";
import { escapeHTML, timeAgo } from "../app/helpers.js";
import { isAuthenticated } from "../authentication/isAuth.js";

export var Msgs = {lastid : 0}
export async function fetchHistory(receiverNickname) {
  const messages = document.querySelector("#messages");
  if (!messages) {
    console.error("Messages container not found");
    return;
  }
  const id = await isAuthenticated();
  try {
    const res = await fetch(
      `/dm?receiver=${encodeURIComponent(receiverNickname)}&lastid=${Msgs.lastid}`
    );
    console.log('res :',res);
    if (!res.ok) {
      throw new Error("error fetching dm history");
    }
    const dms = await res.json()
    
            //messages.replaceChildren();
    // if (dms) displayHistory(dms, id);

    // messages.innerHTML = ""; // Clear once before populating

    if (dms && dms.length) {
      displayHistory(dms, id);
    } 
    // const debouncedDisplay = debounce((dms, id) => {
    //     displayHistory(dms, id)
    // }, 200);

    // document.addEventListener('scroll', () => {
    //     debouncedDisplay(dms, id);
    // });
  } catch (error) {
    console.error(error);
  }
}

function displayHistory(dms, id) {
  const messages = document.getElementById("messages");
  if (!messages) {
    console.log("error in messages");
    return;
  }
  for (let i = dms.length ; i >= 0 ; i--) {
    const dm = dms[i];
    console.log(dm);

    if (dm) {
      const messageCard = document.createElement("div");
      messageCard.className = "message";

      if (id === dm.Sender_id) {
        messageCard.id = "msg-sent";
      } else {
        messageCard.id = "msg-received";
      }

      const msgSender = document.createElement("div");
      msgSender.className = "message-senedr";
      msgSender.textContent = dm.Sender_name;

      const messageContent = document.createElement("div");
      messageContent.className = "message-content";
      messageContent.textContent = escapeHTML(dm.Content);

      const messageTime = document.createElement("div");
      messageTime.className = "message-time";
      messageTime.textContent = timeAgo(new Date(dm.Timestamp));

      messageCard.appendChild(msgSender);
      messageCard.appendChild(messageTime);
      messageCard.appendChild(messageContent);
      messages.append(messageCard);
    }
  }
  messages.scrollTo({
    top: messages.scrollHeight - 50,
    behavior: 'auto'
  })
  Msgs.lastid = dms[dms.length-1].ID
}
