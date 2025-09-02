const express=require("express");
const app=express();
const authRouter=require('./routes/auth');
const workspaceRouter=require('./routes/workspace');
const projectRouter=require('./routes/project');
const taskRouter=require('./routes/task');
const authenticateUser=require('./middleware/authentication');
require("dotenv").config();

app.use(express.json());

app.get('/',async(req,res)=>{
    res.json("Hello World");
})
app.use('/api/v1/dashboard',authenticateUser,workspaceRouter);
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/dashboard/workspaces',authenticateUser,projectRouter);
app.use('/api/v1/dashboard/workspaces/:workspaceId/projects',authenticateUser,taskRouter);
const PORT=4000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});