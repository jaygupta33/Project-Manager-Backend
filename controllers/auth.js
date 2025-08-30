const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");

const sendEmailOtp = async (req, res) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.json({ message: "User already exists" });
    }

    function generateOTP() {
      return crypto.randomInt(100000, 999999).toString();
    }
    const otp = generateOTP();

    function hashOtp(otp) {
      return crypto.createHash("sha256").update(otp).digest("hex");
    }

    const otpHash = hashOtp(otp);

    const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.pendingUser.upsert({
      where: { email: email }, // check if this email exists
      update: {
        otp: otpHash,
        otpExpiresAt: otpExpiration,
      }, // update if found
      create: {
        email,
        otp: otpHash,
        otpExpiresAt: otpExpiration,
      }, // insert if not found
    });

    const msg = {
      to: email,
      from: "getintouchlumina@gmail.com",
      subject: "Your OTP Code for Email Verification (PROJECT MANAGER)",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      html: `<h3>Your OTP code for email verification is ${otp}. It will expire in 5 minutes.</h3>`,
    };

    const info = await sgMail.send(msg);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const pending = await prisma.pendingUser.findUnique({ where: { email } });
    if (!pending) return res.status(400).json({ error: "No OTP found" });

    if (pending.otpExpiresAt < new Date())
      return res.status(400).json({ error: "OTP expired" });

    function hashOtp(otp) {
      return crypto.createHash("sha256").update(otp).digest("hex");
    }

    const otpHash = hashOtp(otp);
    if (otpHash !== pending.otp)
      return res.status(400).json({ error: "Invalid OTP" });

    // ✅ OTP verified → create real user
    const user = await prisma.user.create({
      data: {
        email: pending.email,
        // optionally add username/password collected later
      },
    });

    await prisma.pendingUser.delete({ where: { email } });

    res.json({ message: "User verified & created", user });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  sendEmailOtp,
  verifyOtp,
};
