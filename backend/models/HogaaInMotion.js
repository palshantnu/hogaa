const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HogaaInMotion = sequelize.define('HogaaInMotion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    image: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'GIF filename'
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
    tableName: 'hogaa_in_motion',
    timestamps: true,
    underscored: true
});

module.exports = HogaaInMotion;
