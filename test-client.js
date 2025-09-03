// To run this file:
// 1. Make sure your server is running.
// 2. Install the client library: npm install socket.io-client
// 3. Run the script: node test-client.js

const {io}=require('socket.io-client')

// Replace this with the URL of your running Express server
const SERVER_URL = "http://localhost:4000";

// Replace this with a valid projectId from your database
// You can get this by manually creating a project via your API or looking at your database
const TEST_PROJECT_ID = "cmf2fojuo0000g0xstx57v8jf";

const socket = io(SERVER_URL);

socket.on("connect", () => {
  console.log(`Connected to the server with ID: ${socket.id}`);

  // After connecting, join the project room to listen for events.
  socket.emit("join_project", TEST_PROJECT_ID);
  console.log(`Attempted to join room: ${TEST_PROJECT_ID}`);
});

socket.on("disconnect", () => {
  console.log("Disconnected from the server.");
});

socket.on("task_updated", (task) => {
  console.log("--- Task Updated (Real-time event) ---");
  console.log(`Task ID: ${task.id}`);
  console.log(`New Status: ${task.status}`);
  console.log("-------------------------------------");
});

socket.on("new_comment", (comment) => {
  console.log("--- New Comment (Real-time event) ---");
  console.log(`Comment from ${comment.user.username}:`);
  console.log(`Content: ${comment.content}`);
  console.log("-------------------------------------");
});

console.log("Client started. Waiting for connection and events...");
