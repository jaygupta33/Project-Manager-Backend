const express=require('express');
const router=express.Router();
const {createTask,getTasks,updateTask,deleteTask,addComment}=require('../controllers/task');
router.post('/:projectId/tasks/create',createTask);
router.get('/:projectId/tasks', getTasks);
router.put('/:projectId/tasks/:taskId/update', updateTask);
router.delete('/:projectId/tasks/:taskId/delete',deleteTask);
router.post('/:projectId/tasks/:taskId/comments/add',addComment);
module.exports = router;