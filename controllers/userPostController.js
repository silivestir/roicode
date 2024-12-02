// controllers/userPostController.js
const UserPost = require('../models/post');
const sequelize = require('./../config/dbConf');
const User = require('../models/userModel');

// Create a new post
const createPost = async (req, res) => {
    try {
        const { userId, content ,posttitle,posttype,username} = req.body;

        // Validate content
        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'Content cannot be empty' });
        }

        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create post
        const post = await UserPost.create({
            userId: user.id,
            content:content,
            like: false,
            posttitle:posttitle,
            posttype:posttype,
            username:username,
        });

        // Respond with the newly created post
        return res.status(201).json({
            message: 'Post created successfully',
            post: post,
        });
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};


// Get all posts
const getAllPosts = async (req, res) => {
    try {
        const posts = await UserPost.findAll({
            include: {
                model: User,
                attributes: ['username'], // Only return the username from User
            },
            attributes: ['id', 'createdAt', 'content', 'posttitle', 'posttype','username'], // Attributes from UserPost
        });

        console.log('Raw posts fetched:', JSON.stringify(posts, null, 2));

        // Process the data to include username at the top level
        const processedPosts = posts.map(post => ({
            id: post.id,
            createdAt: post.createdAt,
            content: post.content,
            posttitle: post.posttitle,
            posttype: post.posttype,
            username: post.User?.username, // Safely access username
        }));

        console.log('Objects have been fetched:', processedPosts);
        return res.status(200).json(processedPosts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get single post by ID
const getPostById = async (req, res) => {
    try {
        const { postId } = req.params; // Retrieve postId from the request parameters
        

        // Find the post by ID
        const post = await UserPost.findOne({
            where: { id: postId },
            include: { 
                model: User,
                attributes: ['username'], // Return the username
            },
            attributes: ['id', 
                'createdAt', 
                'content' ,'posttitle' ,
                [sequelize.literal('(SELECT COUNT(*) FROM "Reports" WHERE "postId" = "UserPost"."id")'), 'reportCount'],
                [sequelize.literal('(SELECT COUNT(*) FROM "UserPosts" WHERE "id" = "UserPost"."id" AND "like" = true)'), 'likeCount']
            ], // Return post-specific fields
        });

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Respond with the post data
        return res.status(200).json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get all posts by user ID
const getPostsByUserId = async (req, res) => {
    try {
        const userId = req.params.userId; // Assuming the logged-in user's ID is attached to req.user
        console.log('profile posts for id', userId)
        // Check if user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch all posts created by the user
        const posts = await UserPost.findAll({
            where: { userId: userId },
            include: {
                model: User,
                attributes: ['username'], // Only return the username
            },
            attributes: ['id', 'createdAt', 'content'], // Return post-specific fields
        });

        // Return the user's posts
        return res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts by user ID:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};


// Update a post
const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        // Find post by ID
        const post = await UserPost.findByPk(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Update the post content
        post.content = content;
        await post.save();

        return res.status(200).json({ message: 'Post updated', post });
    } catch (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

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
    createPost,
    getAllPosts,
    getPostById,
    getPostsByUserId,
    updatePost,
    deletePost,
};
