const express=require('express');
const router=express.Router();
const {createProject,getProjects,getAllTasksInWorkspace}=require('../controllers/project');

router.post('/:workspaceId/projects/create', createProject);
router.get('/:workspaceId/projects', getProjects);
router.get('/:workspaceId/projects/allTasks', getAllTasksInWorkspace);
module.exports = router;