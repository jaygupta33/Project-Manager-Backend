const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createWorkspace=async(req,res)=>{
  const {name} = req.body;
  const userId=req.user.id;
  console.log(userId);
  if (!name || !userId) {
    return res.status(400).json({ error: "Name and User ID are required" });
  }
  
try{
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
  }

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
        return res
          .status(403)
          .json({
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
              username: true
            } // This includes the related User object for each member
        },
      }
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




  module.exports={createWorkspace,getWorkspaceMembers,getWorkspaces};
