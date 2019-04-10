'use strict';

module.exports = 
{
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Parks',
      'parkcode',
      {
        type: Sequelize.STRING
      })
  },

  down: (queryInterface, Sequelize) => 
  {
    {
      return queryInterface.removeColumn(
        'Parks',
        'parkcode',);
    }
  }
}
