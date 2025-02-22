const socketUrl = `ws://${document.location.host}/ws`;
export const socket = new WebSocket(socketUrl);
