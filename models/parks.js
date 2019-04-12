'use strict';
module.exports = (sequelize, DataTypes) => {
  const Parks = sequelize.define('Parks', {
    category: DataTypes.STRING,
    userid: DataTypes.STRING,
<<<<<<< HEAD
    parkid: DataTypes.STRING
=======
    parkid: DataTypes.STRING,
>>>>>>> master
  }, {});
  Parks.associate = function(models) {
    // associations can be defined here
  };
  return Parks;
};