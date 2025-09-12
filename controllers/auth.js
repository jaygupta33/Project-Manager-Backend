const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { get } = require("http");

const sendEmailOtp = async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

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
      where: { email: email },
      update: {
        otp: otpHash,
        otpExpiresAt: otpExpiration,
      },
      create: {
        email,
        otp: otpHash,
        otpExpiresAt: otpExpiration,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your OTP Code for Email Verification (PROJECT MANAGER)",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      html: `<h3>Your OTP code for email verification is ${otp}. It will expire in 5 minutes.</h3>`,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp, username, password } = req.body;

  try {
    // Validate required fields
    if (!email || !otp || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

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

    // Only hash password after OTP validation is successful
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email: pending.email,
        username: username,
        password: hashedPassword,
      },
    });

    await prisma.pendingUser.delete({ where: { email } });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET
    );

    res.status(200).json({ message: "User verified & created", user, token });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

const login = async (req, res) => {
  const { password, username } = req.body;
  if (!username || !password) {
    return res.status(401).json("please enter email and password");
  }
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return res.status(401).json("Invalid credentials");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(400).json("Invalid password");
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    {
      expiresIn: "10h",
    }
  );
  res.status(200).json({ user: { username: user.username }, token });
};

const getInvitedUsers = async (req, res) => {
   const { token } = req.query;
  if (token) {
    try {
      // Step 1: Find the pending user using the token
      // You must hash the token from the query to compare it with the hashed token in your database
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const pendingUser = await prisma.pendingUser.findFirst({
        where: {
          otp: hashedToken,
          otpExpiresAt: {
            gt: new Date(), // Check if the token has not expired
          },
        },
      });

      if (!pendingUser) {
        return res.status(404).send("Invalid or expired invitation link.");
      }

      // Step 2: Render the sign-up page with the pre-filled data
      res.render("signup", { email: pendingUser.email, token: token });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred.");
    }
  } else {
    // If no token is present, serve the standard signup form
    res.render("signup", { email: "", token: "" });
  }
}

 const signUpInvitedUser = async (req, res) => {
  const { email, password, username, token } = req.body;

  try {
    // Step 1: Validate the token and find the pending user again
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const pendingUser = await prisma.pendingUser.findFirst({
      where: {
        otp: hashedToken,
        otpExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!pendingUser) {
      return res
        .status(400)
        .json({ message: "Invalid or expired invitation token." });
    }
    
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash(password, salt);
    // Step 2: Use a transaction to perform all database operations atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create the new User
      const newUser = await tx.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
        },
      });

      // Create the WorkspaceMember record
      await tx.workspaceMember.create({
        data: {
          userId: newUser.id,
          workspaceId: pendingUser.workspaceId,
          role: "MEMBER",
        },
      });

      // Delete the pending user record to prevent re-use
      await tx.pendingUser.delete({
        where: { id: pendingUser.id },
      });

      return newUser;
    });

    res
      .status(201)
      .json({
        message: "Account created and you have been added to the workspace.",
        user: result,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred during signup." });
  }
}

module.exports = {
  sendEmailOtp,
  verifyOtp,
  login,
  getInvitedUsers,
  signUpInvitedUser
};
