const express=require('express');
const router=express.Router();

const {createTeam}=require('../controllers/team');
router.post('/:workspaceId/teams/create',createTeam);
module.exports = router;