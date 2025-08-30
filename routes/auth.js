const express=require('express');
const router=express.Router();

const {sendEmailOtp,verifyOtp}=require('../controllers/auth');

router.post('/send-otp',sendEmailOtp);
router.post('/verify-otp',verifyOtp);

module.exports=router;