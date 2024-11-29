// routes.js
const express = require('express');
const { likePost, getPostLikes, unlikePost } = require('../controllers/postLikesController');
const router=express.Router()
router.post('/posts/', likePost );

const {deletePost } = require('../controllers/deletePostController');
//const router = express.Router();

router.post('/posts/' ,(req,res,next)=>{console.log(`DELETEDEEEEEEEEEEEEEEEEEEEEES`) ,next()}, deletePost );


router.get('/posts/:postId', (req,res,next)=>{console.log(`Heyyy you called`) ,next()}, getPostLikes);

router.delete('/:postId', unlikePost); // Optional: If you want to allow unliking

module.exports = router;
