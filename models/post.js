const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require("./../config/dbConf");
const User = require('./../models/userModel');

// Define the UserPost model
const UserPost = sequelize.define('UserPost', {
   id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Automatically generate UUIDs
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
        model: User,
        key: 'id', // Assuming 'id' is UUID in the User model
    },
    onDelete: 'CASCADE',
  },
  username: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  posttitle: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  posttype: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  like: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    default: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  timestamps: true,
});

// Associations
User.hasMany(UserPost, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});
UserPost.belongsTo(User, {
  foreignKey: 'userId',
});

module.exports = UserPost;
