const express=require("express");
const app=express();
const authRouter=require('./routes/auth');
require("dotenv").config();

app.use(express.json());

app.get('/',async(req,res)=>{
    res.json("Hello World");
})

app.use('/api/v1/auth',authRouter);
const PORT=4000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});