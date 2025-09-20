const express=require('express');
const router=express.Router();

const {createTeam,getTeamMembers,addTeamMember,getTeams}=require('../controllers/team');
router.post('/:workspaceId/teams/create',createTeam);
router.post('/:workspaceId/teams/:teamId/members',addTeamMember);
router.get('/:workspaceId/teams',getTeams);
router.get('/:workspaceId/teams/:teamId/members',getTeamMembers);
module.exports = router;