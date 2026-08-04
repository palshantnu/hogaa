const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Banner = sequelize.define('Banner', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    media_type: {
        type: DataTypes.ENUM('image', 'video'),
        defaultValue: 'image'
    },
    image: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    video: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    video_poster: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    link: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'banners',
    timestamps: true,
    underscored: true
});

module.exports = Banner;