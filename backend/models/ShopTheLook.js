const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ShopTheLook = sequelize.define('ShopTheLook', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    label: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    image: {
        type: DataTypes.STRING(500),
        allowNull: false
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
    tableName: 'shop_the_look',
    timestamps: true,
    underscored: true
});

module.exports = ShopTheLook;
