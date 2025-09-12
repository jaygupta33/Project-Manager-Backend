const express=require('express');
const router=express.Router();
const {sendEmailOtp,verifyOtp,login,getInvitedUsers,signUpInvitedUser}=require('../controllers/auth');
  
router.post('/signup',signUpInvitedUser);
router.get('/signup', getInvitedUsers);
router.post('/send-otp',sendEmailOtp);
router.post('/verify-otp',verifyOtp);
router.post('/login', login);


module.exports=router;