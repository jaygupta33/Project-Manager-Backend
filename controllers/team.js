const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createTeam = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ error: "Team name is required." });
  }

  try {
    const isMember = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
        workspaceId: req.params.workspaceId,
      },
    });

    if (!isMember) {
      return res.status(403).json({
        error: "Access denied. You are not a member of this workspace.",
      });
    }

    const team = await prisma.team.create({
      data: {
        name,
        members: { create: { userId: userId } }, // Add creator as initial member of the team
      },

      include: {
        members: true,
      },
    });

    return res.status(201).json({ team });
  } catch (error) {
    console.error("Error creating team:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTeam,
};
