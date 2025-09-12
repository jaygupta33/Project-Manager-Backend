const express=require('express');
const router=express.Router();

const {createWorkspace,getWorkspaceMembers,getWorkspaces,addWorkspaceMember}=require('../controllers/workspace');
router.post('/workspaces/create',createWorkspace);
router.get('/workspaces/:workspaceId/members', getWorkspaceMembers);
router.get('/workspaces', getWorkspaces);
router.post('/workspaces/:workspaceId/members/add', addWorkspaceMember);
module.exports = router;
