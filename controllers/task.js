const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assigneeId } = req.body;
  const userId = req.user.id;

  if (!title) {
    return res.status(400).json({ error: "Task title is required." });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: { include: { members: true } } },
    });

    const isMember = project.workspace.members.some(
      (member) => member.userId === userId
    );

    if (!isMember) {
      return res.status(403).json({ error: "Access denied." });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
        project: { connect: { id: projectId } },
      },
    });

    res.status(201).json({ message: "Task created successfully.", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

const getTasks = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    // 1. Authorization Check (same as create)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { workspace: { include: { members: true } } },
    });

    const isMember = project.workspace.members.some(
      (member) => member.userId === userId
    );

    if (!isMember) {
      return res.status(403).json({ error: "Access denied." });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId: projectId },
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
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

/**
 * Controller to update a task (e.g., change its status via drag-and-drop).
 */
const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;
  const { status, ...data } = req.body;

  try {
    // 1. Authorization Check
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { include: { workspace: { include: { members: true } } } },
      },
    });

    const isMember = task.project.workspace.members.some(
      (member) => member.userId === userId
    );

    if (!isMember) {
      return res.status(403).json({ error: "Access denied." });
    }

    // 2. Update the Task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...data, // This allows updating any field passed in the body
        ...(status && { status }), // Update status if provided
      },
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
    });

    res
      .status(200)
      .json({ message: "Task updated successfully.", task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

/**
 * Controller to delete a task.
 */
const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  try {
    // 1. Authorization Check (same as update)
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { include: { workspace: { include: { members: true } } } },
      },
    });

    const isMember = task.project.workspace.members.some(
      (member) => member.userId === userId
    );

    if (!isMember) {
      return res.status(403).json({ error: "Access denied." });
    }

    // 2. Delete the Task
    await prisma.task.delete({ where: { id: taskId } });

    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

const addComment = async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  console.log("addComment called with:", { taskId, content, userId });

  if (!content) {
    console.log("Error: Comment content is missing");
    return res.status(400).json({ error: "Comment content is required." });
  }

  try {
    console.log("Finding task with ID:", taskId);
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { include: { workspace: { include: { members: true } } } },
      },
    });

    console.log("Task found:", task ? "Yes" : "No");
    if (!task) {
      console.log("Error: Task not found");
      return res.status(404).json({ error: "Task not found." });
    }

    const isMember = task.project.workspace.members.some(
      (member) => member.userId === userId
    );

    console.log("Is member:", isMember);
    if (!isMember) {
      console.log("Error: Access denied for user:", userId);
      return res.status(403).json({ error: "Access denied." });
    }

    console.log("Creating comment with data:", { content, userId, taskId });
    const comment = await prisma.comment.create({
      data: {
        content,

        user: { connect: { id: userId } },
        task: { connect: { id: taskId } },
      },

      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    console.log("Comment created successfully:", comment);
    res.status(201).json({ message: "Comment added successfully.", comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

const getComments = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { include: { workspace: { include: { members: true } } } },
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    const isMember = task.project.workspace.members.some(
      (member) => member.userId === userId
    );

    if (!isMember) {
      return res.status(403).json({ error: "Access denied." });
    }

    const comments = await prisma.comment.findMany({
      where: { taskId: taskId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  addComment,
  getComments,
};
