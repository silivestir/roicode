// models/postLikes.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConf'); // Adjust the path as necessary
const User = require('./userModel'); // Import the User model
const UserPost = require('./post'); // Import the Post model

const reports = sequelize.define('reports', {
    // You can include additional fields if necessary
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    reportsCount:{
        type:DataTypes.INTEGER,
        defaultValue:0, 
        
   },  
    username:{
    type:DataTypes.TEXT,
    defaultValue:null, 
    
}
    // Other fields can be defined here if needed
}, {
    // Optional: Add options here if needed
    timestamps: true, // This will add createdAt and updatedAt timestamps
});

// Define associations
reports.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
reports.belongsTo(UserPost, { foreignKey: 'postId', onDelete: 'CASCADE' });

// Export the model
module.exports = reports;
