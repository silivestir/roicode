// controllers/postController.js

const UserPost = require('../models/post');
const Report = require('../models/postReport');

// Report a post
const reportPost = async (req, res) => {
    try {
        
        const { postId, userId, username } = req.body;
        console.log('i have been called', postId, userId)
      

      
        // Check if a report already exists from this user for this post
        const existingReport = await Report.findOne({
            where: {
                postId: postId,
                userId: userId,
            },
        });

        if (existingReport) {
            return res.status(400).json({ message: 'You have already joined this program ' });
        }

        // Create a new report
      Report.create({ userId:userId, postId:postId, username:username });

        // Count reports for this post
        const reportCount = await Report.count({
            where: { postId: postId },
        });

        // Delete the post if it has more than 5 reports
         if (reportCount >= 5) {
            const postToDelete = await UserPost.findByPk(postId);
            if (postToDelete) {
                await postToDelete.destroy();
                return res.status(200).json({ message: 'Post deleted due to multiple reports' });
            }
        }

        return res.status(200).json({ message: 'Post reported successfully' });
    } catch (error) {
        console.error('Error reporting post:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    reportPost, // Export the report function
};
