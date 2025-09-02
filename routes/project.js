const express=require('express');
const router=express.Router();
const {createProject,getProjects}=require('../controllers/project');

router.post('/:workspaceId/projects/create', createProject);
router.get('/:workspaceId/projects', getProjects);
module.exports = router;