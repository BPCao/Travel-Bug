'use strict';
module.exports = (sequelize, DataTypes) => {
  const Park = sequelize.define('Park', {
    parkname: DataTypes.STRING,
    category: DataTypes.STRING,
    userid: DataTypes.INTEGER,
    parkid: DataTypes.STRING,
    parkcode: DataTypes.STRING
  }, {});
  Park.associate = function(models) {
    // associations can be defined here
  };
  return Park;
};