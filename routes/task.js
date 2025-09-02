const express=require('express');
const router=express.Router();
const {createTask,getTasks,updateTask,deleteTask}=require('../controllers/task');
router.post('/:projectId/tasks/create',createTask);
router.get('/:projectId/tasks', getTasks);
router.put('/:projectId/tasks/:taskId/update', updateTask);
router.delete('/:projectId/tasks/:taskId/delete',deleteTask);
module.exports = router;