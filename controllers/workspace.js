const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const createWorkspace = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;
  if (!name || !userId) {
    return res.status(400).json({ error: "Name and User ID are required" });
  }
   
  try {
    const workspace = await prisma.workspace.create({
      data: {
        name,
        // Use a nested `create` to automatically create the WorkspaceMember
        // and link it to the newly created workspace.
        members: {
          create: {
            role: "ADMIN",
            userId: userId,
          },
        },
      },
      // The `include` option is crucial. It tells Prisma to fetch the related
      // `members` data and include it in the returned `workspace` object.
      include: {
        members: true,
      },
    });
    res.status(201).json({ workspace });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addWorkspaceMember = async (req, res) => {
  const { workspaceId } = req.params;
  const { email } = req.body;
  const userId = req.user.id;

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found." });
    }

    const isMember = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
        workspaceId: workspaceId,
      },
    });

    // If the user is not a member, return a 403 Forbidden error.
    if (!isMember) {
      return res.status(403).json({
        error: "Access denied. You are not a member of this workspace.",
      });
    }

    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: workspaceId,
        user: { email: email },
      },
    });
    if (existingMember) {
      return res
        .status(409)
        .json({ message: "User is already a member of this workspace." });
    }

    const user = await prisma.user.findUnique({ where: { email: email } });
     

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });


    if (user) {
      // User is already registered: Send an invitation to accept/decline
      const pendingInvite = await prisma.pendingWorkspaceMember.create({
        data: {
          workspaceId: workspaceId,
          userId: user.id,
        },
      });

      // Send invitation email
      // This email will contain a link to the accept/decline route


      const sendInvitationEmail = async (
        recipientEmail,
        workspaceName,
        invitationId
      ) => {
        // Construct the invitation link. The domain should be your application's
        // front-end URL where the user will accept the invitation.
        const invitationLink = `https://localhost:3000/invitations/${invitationId}/accept`;

        const mailOptions = {
          from: `"Project Manager" <${process.env.EMAIL_USER}>`,
          to: recipientEmail,
          subject: `You're invited to join the ${workspaceName} workspace`,
          html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Join ${workspaceName}</h2>
        <p>Hi there,</p>
        <p>You have been invited to join the <strong>${workspaceName}</strong> workspace on Project Manager.</p>
        <p>Please click the button below to accept the invitation and join the team.</p>
        <a href="${invitationLink}" style="display: inline-block; padding: 10px 20px; color: #ffffff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
          Join Workspace
        </a>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br>Project Manager Team</p>
      </div>
    `,
        };
        await transporter.sendMail(mailOptions);
      };

      await sendInvitationEmail(email, workspace.name, pendingInvite.id);

      res.status(202).json({ message: "Invitation sent to existing user." });
    } else {
      const generateRegistrationToken = () => {
        return crypto.randomBytes(32).toString("hex");
      };
      
      const token = generateRegistrationToken();
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
       const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);
          await prisma.pendingUser.create({
        data: {
          workspaceId: workspaceId,
          email: email,
          otp: hashedToken,
          otpExpiresAt: otpExpiration,
        },
           });

      const sendRegistrationEmail = async (
        recipientEmail,
        registrationToken
      ) => {
        const registrationLink = `https://localhost:3000/auth/signup?token=${registrationToken}`;
        const mailOptions = {
          from: `"Project Manager" <${process.env.EMAIL_USER}>`,
          to: recipientEmail,
          subject: "You have been invited to register on Project Manager",
          html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">w
        <h2>Complete Your Registration</h2>
        <p>Hi there,</p>
        <p>You have been invited to join Project Manager. To create your account, please click the link below:</p>
        <a href="${registrationLink}" style="display: inline-block; padding: 10px 20px; color: #ffffff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">
          Create My Account
        </a>
        <p>This invitation link will expire in one hour for security reasons.</p>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>Best regards,<br>Project Manager Team</p>
      </div>
    `,
        };
        await transporter.sendMail(mailOptions);
      };
      await sendRegistrationEmail(email, token);
      res
        .status(202)
        .json({ message: "Invitation to register sent to new user." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWorkspaceMembers = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.user.id;

  try {
    // First, check if the authenticated user is a member of the workspace.
    const isMember = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
        workspaceId: workspaceId,
      },
    });

    // If the user is not a member, return a 403 Forbidden error.
    if (!isMember) {
      return res.status(403).json({
        error: "Access denied. You are not a member of this workspace.",
      });
    }

    // If authorized, fetch all members of the workspace.
    // The `include: { user: true }` is essential to get the user's details.
    const members = await prisma.workspaceMember.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          }, // This includes the related User object for each member
        },
      },
    });

    // Return the list of members.
    res.status(200).json({ members });
  } catch (error) {
    console.error("Error fetching workspace members:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

const getWorkspaces = async (req, res) => {
  const userId = req.user.id;

  try {
    // Find all WorkspaceMember entries for the authenticated user.
    // The `include` statement fetches the related Workspace data.
    const memberships = await prisma.workspaceMember.findMany({
      where: {
        userId: userId,
      },
      include: {
        workspace: true,
      },
    });

    // The result is an array of memberships, each containing a `workspace` object.
    res.status(200).json({ memberships });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

const openInvite = async (req, res) => {
  const { invitationId } = req.params;

  try {
    const pendingInvite = await prisma.pendingWorkspaceMember.findUnique({
      where: { id: invitationId },
      include: {
        workspace: true,
        user: true,
      },
    });

    if (!pendingInvite || pendingInvite.status !== 'PENDING') {
      return res.status(404).send('Invalid or expired invitation link.');
    }

    // Render a confirmation page for the user to accept/decline
    res.render('acceptInvitation', {
      invitationId: pendingInvite.id,
      workspaceName: pendingInvite.workspace.name,
      userName: pendingInvite.user.username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred.');
  }

}

const acceptInvite = async (req, res) => {
  const { invitationId } = req.params;
  const userId = req.user.id;

  try {
      const pendingInvite = await prisma.pendingWorkspaceMember.findUnique({
      where: { id: invitationId },
    });

    // Security check: Ensure the authenticated user matches the invited user
    if (!pendingInvite || pendingInvite.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized action.' });
    }

    // Use a transaction for an atomic operation
    await prisma.$transaction(async (tx) => {
      // Create the WorkspaceMember record
      await tx.workspaceMember.create({
        data: {
          userId: pendingInvite.userId,
          workspaceId: pendingInvite.workspaceId,
          role: 'MEMBER', // Default role for invited members
        },
      });

      // Update the status of the pending invitation to accepted
      await tx.pendingWorkspaceMember.update({
        where: { id: invitationId },
        data: { status: 'ACCEPTED' },
      });
    });

    res.status(200).json({ message: 'Invitation accepted successfully.' });
}  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred.' });
  }
}

module.exports = {
  createWorkspace,
  getWorkspaceMembers,
  getWorkspaces,
  addWorkspaceMember,
  openInvite,
  acceptInvite,
};