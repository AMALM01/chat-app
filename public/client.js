const socket = io();

const loginDiv = document.getElementById('login');
const chatDiv = document.getElementById('chat');
const roomInput = document.getElementById('room');
const roomNameInput = document.getElementById('roomName');
const usernameInput = document.getElementById('username');
const joinBtn = document.getElementById('joinBtn');
const roomTitle = document.getElementById('roomTitle');
const status = document.getElementById('status');
const messages = document.getElementById('messages');
const msgInput = document.getElementById('msg');
const sendBtn = document.getElementById('sendBtn');
const emojiBtn = document.getElementById('emojiBtn');

let room = '';
let username = '';
let color = '';

function randomColor() {
  const colors = ['#e91e63','#9c27b0','#2196f3','#4caf50','#ff9800','#795548'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Join room
joinBtn.addEventListener('click', () => {
  room = roomInput.value.trim();
  const roomName = roomNameInput.value.trim() || room;
  username = usernameInput.value.trim() || 'Anonymous';
  color = randomColor();

  if (!room) return alert('Please enter a room ID');

  socket.emit('join-room', { room, username, color, roomName });
  roomTitle.textContent = roomName;
  status.textContent = 'Connected';

  loginDiv.style.display = 'none';
  chatDiv.style.display = 'flex';
  msgInput.focus();
});

// Send message
sendBtn.addEventListener('click', () => {
  const message = msgInput.value.trim();
  if (!message) return;
  socket.emit('chat-message', { room, username, color, message });
  msgInput.value = '';
});

let lastSender = null; // track previous message sender

socket.on('chat-message', ({ username: sender, color, message }) => {

  // Add spacing if sender changes
  if (lastSender && lastSender !== sender) {
    const br = document.createElement('div');
    br.style.height = '12px'; // space between different users
    messages.appendChild(br);
  }

  const msg = document.createElement('div');
  msg.classList.add('message');
  msg.style.background = color;
  msg.style.padding = '8px 12px';
  msg.style.borderRadius = '12px';
  msg.style.maxWidth = '75%';
  msg.style.wordWrap = 'break-word';

  // Align messages
  if (sender === username) {
    msg.style.alignSelf = 'flex-end'; // your messages on right
    msg.style.color = 'white';
  } else {
    msg.style.alignSelf = 'flex-start'; // other user messages on left
    msg.style.color = 'black';
  }

  msg.innerHTML = `<b>${sender}:</b> ${message}`;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;

  lastSender = sender; // update last sender
});

// Delete old messages
socket.on('delete-message', (messageText) => {
  const allMessages = messages.querySelectorAll('.message');
  allMessages.forEach(m => {
    if (m.textContent.includes(messageText)) {
      m.remove();
    }
  });
});

// Emoji picker
const picker = new EmojiButton({ position: 'top-end' });
emojiBtn.addEventListener('click', () => {
  picker.togglePicker(emojiBtn);
});
picker.on('emoji', emoji => {
  msgInput.value += emoji;
  msgInput.focus();
});
