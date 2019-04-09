'use strict';
module.exports = (sequelize, DataTypes) => {
  const Parks = sequelize.define('Parks', {
    parkname: DataTypes.STRING,
    category: DataTypes.STRING,
    userid: DataTypes.STRING,
    parkid: DataTypes.STRING,
    parkcode: DataTypes.STRING
  }, {});
  Parks.associate = function(models) {
    // associations can be defined here
  };
  return Parks;
};