// chatHistory.js - Complete Version

import { escapeHTML } from "../app/helpers.js";
import { isAuthenticated } from "../authentication/isAuth.js";

// Update Msgs object to track pagination properly
export var Msgs = {
  lastid: 0,
  offset: 0,
  noMoreMessages: false
};

// Add reset function to clear history state
export function resetChatHistory() {
  Msgs.lastid = 0;
  Msgs.offset = 0;
  Msgs.noMoreMessages = false;
}

// Updated fetchHistory function with proper pagination
export async function fetchHistory(receiverNickname) {
  const messages = document.querySelector("#messages");
  if (!messages) {
    console.error("Messages container not found");
    return;
  }
  
  const id = await isAuthenticated(); 
  try {
    const res = await fetch(
      `/dm?receiver=${encodeURIComponent(receiverNickname)}&offset=${Msgs.offset}&limit=10`
    );
    
    if (!res.ok) {
      throw new Error("error fetching dm history");
    }
    const dms = await res.json();

    if (dms && dms.length) {
      // Mark as no more messages if we got fewer than requested
      if (dms.length < 10) {
        Msgs.noMoreMessages = true;
      }
      
      // Increment offset for next pagination
      Msgs.offset += dms.length;
      
      // Display the messages
      displayHistory(dms, id);
    } else {
      // No messages returned means we've reached the end
      Msgs.noMoreMessages = true;
    }
  } catch (error) {
    console.error(error);
  }
}

// Fixed displayHistory function that doesn't reverse messages
function displayHistory(dms, id) {
  const messages = document.getElementById("messages");
  if (!messages) {
    console.log("error in messages");
    return;
  }
  
  // Create a document fragment to batch DOM operations
  const fragment = document.createDocumentFragment();
  
  // Don't reverse the messages - they're already in DESC order from the server
  dms.forEach(dm => {
    if (dm) {
      const messageCard = createMessageCard(dm, id);
      // Add new messages at the top
      fragment.prepend(messageCard);
    }
  });
  
  // Insert all messages at once at the beginning of the messages container
  if (messages.firstChild) {
    messages.insertBefore(fragment, messages.firstChild);
  } else {
    messages.appendChild(fragment);
  }

  // Only scroll to bottom on initial load (when offset was 0 before this fetch)
  if (Msgs.offset === dms.length) {
    messages.scrollTop = messages.scrollHeight;
  }
  
  // Update lastid if needed for tracking
  if (dms.length > 0) {
    Msgs.lastid = dms[0].ID;
  }
}

// Existing createMessageCard function
function createMessageCard(dm, currentUserId) {
  return createMessage(dm, {
    currentUserId: currentUserId,
    includeSender: true,
    timeFormat: 'full', // Show full date
    useWrapper: false   // No content wrapper
  });
}

// Existing createMessage function
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