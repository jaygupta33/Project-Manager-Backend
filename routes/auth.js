const express=require('express');
const router=express.Router();
const {sendEmailOtp,verifyOtp,login}=require('../controllers/auth');

router.post('/send-otp',sendEmailOtp);
router.post('/verify-otp',verifyOtp);
router.post('/login', login);


module.exports=router;