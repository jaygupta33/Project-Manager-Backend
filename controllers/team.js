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

const addTeamMember = async (req, res) => {
  const {teamId}=req.params;
  const userId = req.user.id;
  const {userId:invitedUserId}=req.body;
  try{
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

    const isInvitedMember = await prisma.workspaceMember.findFirst({
      where: {
        userId: invitedUserId,
        workspaceId: req.params.workspaceId,
      },
    });

    if (!isInvitedMember) {
      return res.status(403).json({
        error: "Invited user is not a member of this workspace.",
      });
    }

     const teamExists = await prisma.team.findUnique({ where: { id: teamId } });
     const userExists = await prisma.user.findUnique({ where: { id: invitedUserId } });

        if (!teamExists || !userExists) {
          return res.status(404).json({ message: "Team or user not found." });
        }

          const existingMembership = await prisma.teamMember.findUnique({
            where: {
              teamId_userId: {
                teamId: teamId,
                userId: invitedUserId,
              },
            },
          });

          if (existingMembership) {
            return res
              .status(409)
              .json({ message: "User is already a member of this team." });
          }

          const newTeamMember = await prisma.teamMember.create({
            data: {
              teamId,
              userId:invitedUserId,
            },
          });

          res.status(201).json({message:"Team member added successfully",newTeamMember});


  }catch(error){
    console.error("Error adding team member:", error);
    return res.status(500).json({ error: error.message });
  }


}

const getTeams = async (req, res) => {
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

    // Step 1: Find all members of the specified workspace.
    // This sub-query effectively filters down to the relevant users.
    const workspaceMemberships = await prisma.workspaceMember.findMany({
      where: { workspaceId: workspaceId },
      select: { userId: true },
    });

    const userIds = workspaceMemberships.map((member) => member.userId);

    // Step 2: Use the list of user IDs to find all their team memberships.
    const teamMemberships = await prisma.teamMember.findMany({
      where: {
        userId: { in: userIds },
      },
      // Include the Team data for each membership
      include: {
        team: true,
      },
    });

    // Step 3: Extract the Team objects from the results and remove duplicates.
    const teams = teamMemberships.map((membership) => membership.team);
    const uniqueTeams = Array.from(
      new Map(teams.map((team) => [team.id, team])).values()
    );

    return res.status(200).json(uniqueTeams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getTeamMembers = async (req, res) => {
  const { teamId } = req.params;
  const userId = req.user.id;

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

    const members = await prisma.teamMember.findMany({
      where: {
        teamId: teamId,
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
    console.error("Error fetching team members:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamMembers,
  addTeamMember
};
