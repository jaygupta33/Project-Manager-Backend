const express=require('express');
const router=express.Router();

const {createWorkspace,getWorkspaceMembers,getWorkspaces}=require('../controllers/workspace');
router.post('/workspaces/create',createWorkspace);
router.get('/workspaces/:workspaceId/members', getWorkspaceMembers);
router.get('/workspaces', getWorkspaces);
module.exports = router;
