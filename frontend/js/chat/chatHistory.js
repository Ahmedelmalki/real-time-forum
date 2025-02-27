import { escapeHTML } from "../app/helpers.js";
import { isAuthenticated } from "../authentication/isAuth.js";

export var Msgs = {lastid : 0}
export async function fetchHistory(receiverNickname) {
  
  const messages = document.querySelector("#messages");
  if (!messages) {
    console.error("Messages container not found");
    return;
  }
  const id = await isAuthenticated(); // why 
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
    console.log('dm :', dm);
    
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

// function createMessageCard(dm, id) { // 1  AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
//   const messageCard = document.createElement("div");
//   messageCard.className = "message";
//   messageCard.dataset.messageId = dm.ID;

//   if (id === dm.Sender_id) {
//     messageCard.id = "msg-sent";
//   } else {
//     messageCard.id = "msg-received";
//   }

//   const msgSender = document.createElement("div");
//   msgSender.className = "message-senedr";
//   msgSender.textContent = dm.Sender_name;

//   const messageContent = document.createElement("div");
//   messageContent.className = "message-content";
//   messageContent.textContent = escapeHTML(dm.Content);

//   const messageTime = document.createElement("div");
//   messageTime.className = "message-time";
//  // Format time to only show hours and minutes
//  const date = new Date(dm.Timestamp);
//  messageTime.textContent = date.toLocaleTimeString('en-US', { 
//    hour: '2-digit', 
//    minute: '2-digit',
//    hour12: true 
//  });

//  const messageWrapper = document.createElement("div");
//  messageWrapper.className = "message-wrapper";
//  messageWrapper.appendChild(messageContent);
//  messageWrapper.appendChild(messageTime);

//  messageCard.appendChild(msgSender);
//  messageCard.appendChild(messageWrapper);
//   return messageCard;
// }
function createMessageCard(dm, currentUserId) {
  return createMessage(dm, {
    currentUserId: currentUserId,
    includeSender: true,
    timeFormat: 'full', // Show full date
    useWrapper: false   // No content wrapper
  });
}

export function createMessage(messageData, options) {
  const {
    currentUserId,
    includeSender = false,
    timeFormat = 'full',
    useWrapper = false,
    appendTo = null,
  } = options;

  const isSent = currentUserId === messageData.Sender_id;

  // Create main message container
  const messageCard = document.createElement('div');
  messageCard.className = 'message';
  messageCard.id = isSent ? 'msg-sent' : 'msg-received';

  // Set dataset if message ID exists
  if (messageData.ID) {
    messageCard.dataset.messageId = messageData.ID;
  }

  // Add sender element if needed
  if (includeSender) {
    const msgSender = document.createElement('div');
    msgSender.className = 'message-sender';
    msgSender.textContent = messageData.Sender_name;
    messageCard.appendChild(msgSender);
  }

  // Create message content
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.textContent = escapeHTML(messageData.Content);

  // Create and format time element
  const messageTime = document.createElement('div');
  messageTime.className = 'message-time';
  const date = new Date(messageData.Timestamp);

  if (timeFormat === 'time') {
    messageTime.textContent = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    if (useWrapper) {
      messageTime.classList.add(isSent ? 'time-sent' : 'time-received');
    }
  } else {
    messageTime.textContent = date;
  }

  // Handle wrapper element
  if (useWrapper) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'message-wrapper';
    messageWrapper.appendChild(messageContent);
    messageWrapper.appendChild(messageTime);
    messageCard.appendChild(messageWrapper);
  } else {
    messageCard.appendChild(messageContent);
    messageCard.appendChild(messageTime);
  }

  // Append to container if specified
  if (appendTo) {
    appendTo.appendChild(messageCard);
  }

  return messageCard;
}