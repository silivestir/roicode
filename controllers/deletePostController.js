


// controllers/userPostController.js
const UserPost = require('../models/post');
const sequelize = require('./../config/dbConf');
const User = require('../models/userModel');

// Delete a post
const deletePost = async (req, res) => {
    try {
        const { postId } = req.body;
console.log("--------------------------------------------------")
        // Find the post
        const post = await UserPost.findByPk(postId);
        if (!post) {
            console.log("in")
            return res.status(404).json({ message: 'Post not found' });
        }

        // Delete the post
        await post.destroy();
        console.log("deleted")
        return res.status(200).json({ message: 'Post deleted' });
    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
  
    deletePost,
};


