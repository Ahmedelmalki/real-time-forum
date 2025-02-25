import { escapeHTML, timeAgo } from "../app/helpers.js";
import { isAuthenticated } from "../authentication/isAuth.js";

export var Msgs = {lastid : 0}
export async function fetchHistory(receiverNickname) {
  console.log('fetchHistory');
  
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

    if (dms && dms.length) {
      displayHistory(dms, id);
    } 
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
  dms.reverse().forEach(dm => {
    // console.log(dm);
    console.log( ' Msgs.lastid',Msgs.lastid);
    
    if (dm) {
      const messageCard = createMessageCard(dm, id);
      messages.appendChild(messageCard);
    }
  });

  messages.scrollTo({
    top: messages.scrollHeight - 50,
    behavior: 'auto'
  })
  if (dms.length > 0) {
    Msgs.lastid = dms[0].ID;
  }
}

function createMessageCard(dm, id) {
  const messageCard = document.createElement("div");
  messageCard.className = "message";
  messageCard.dataset.messageId = dm.ID;

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

  return messageCard;
}