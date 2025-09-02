const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createProject = async (req, res) => {
  const { workspaceId } = req.params;
  const { name } = req.body;
  const userId = req.user.id;

  if (!name) {
    return res.status(400).json({ error: "Project name is required." });
  }

  try {
    const isMember = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
        workspaceId: workspaceId,
      },
    });

    if (!isMember) {
      return res.status(403).json({
        error: "Access denied. You are not a member of this workspace.",
      });
    }

    const project = await prisma.project.create({
      data: {
        name,

        workspace: {
          connect: {
            id: workspaceId,
          },
        },
      },
      include: {
        tasks: true,
      },
    });

    res.status(201).json({
      message: "Project created successfully.",
      project,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

const getProjects = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.user.id;

  try {
    const isMember = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
        workspaceId: workspaceId,
      },
    });

    if (!isMember) {
      return res
        .status(403)
        .json({
          error: "Access denied. You are not a member of this workspace.",
        });
    }


    const projects = await prisma.project.findMany({
      where: {
        workspaceId: workspaceId,
      },
    });

    res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

module.exports = { createProject,getProjects };
