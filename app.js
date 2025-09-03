const express=require("express");
const app=express();
const {createServer}= require('http');
const {Server}=require('socket.io');
const httpServer = createServer(app);

const authRouter=require('./routes/auth');
const workspaceRouter=require('./routes/workspace');
const projectRouter=require('./routes/project');
const taskRouter=require('./routes/task');
const authenticateUser=require('./middleware/authentication');
require("dotenv").config();

const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for simplicity in development
    methods: ["GET", "POST"],
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(express.json());

app.get('/',async(req,res)=>{
    res.json("Hello World");
})
app.use('/api/v1/dashboard',authenticateUser,workspaceRouter);
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/dashboard/workspaces',authenticateUser,projectRouter);
app.use('/api/v1/dashboard/workspaces/:workspaceId/projects',authenticateUser,taskRouter);


io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a client joins a project, they'll be added to a room
  socket.on("join_project", (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined room: ${projectId}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});


const PORT=4000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});