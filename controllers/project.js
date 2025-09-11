const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const createProject = async (req, res) => {
  const { workspaceId } = req.params;
  const { name, projectStatus, priority, dueDate, description } = req.body;
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
        description,
        priority,
        dueDate,
        projectStatus,
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
      return res.status(403).json({
        error: "Access denied. You are not a member of this workspace.",
      });
    }

    const projects = await prisma.project.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

const getAllTasksInWorkspace = async (req, res) => {
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
      return res.status(403).json({
        error: "Access denied. You are not a member of this workspace.",
      });
    }
    const projects = await prisma.project.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                username: true,
              },
            },
            project: {
              select: {
                id: true,
                name: true,
              },
            },
            comments: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    const tasks = projects.flatMap((project) => project.tasks);
    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

module.exports = { createProject, getProjects, getAllTasksInWorkspace };
