const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Attribute = sequelize.define('Attribute', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    type: {
        type: DataTypes.ENUM('select', 'color', 'size'),
        defaultValue: 'select'
    },
    is_global: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'attributes',
    timestamps: true,
    underscored: true
});

module.exports = Attribute;