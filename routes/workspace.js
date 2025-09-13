const express=require('express');
const router=express.Router();

const {createWorkspace,getWorkspaceMembers,getWorkspaces,addWorkspaceMember,openInvite,acceptInvite}=require('../controllers/workspace');
router.post('/workspaces/create',createWorkspace);
router.get('/workspaces/:workspaceId/members', getWorkspaceMembers);
router.get('/workspaces', getWorkspaces);
router.post('/workspaces/:workspaceId/members/add', addWorkspaceMember);
router.get('/workspaces/:invitationId/accept', openInvite);
router.post('/workspaces/:invitationId/accept', acceptInvite);
module.exports = router;
