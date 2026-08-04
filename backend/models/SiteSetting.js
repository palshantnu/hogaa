const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SiteSetting = sequelize.define('SiteSetting', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    value: { type: DataTypes.TEXT, allowNull: true }
}, {
    tableName: 'site_settings',
    timestamps: true,
    underscored: true
});

module.exports = SiteSetting;
