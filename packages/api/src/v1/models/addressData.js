/* eslint-disable indent */
/**
 * @swagger
 * definitions:
 *   User:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *       first_name:
 *         type: string
 *       last_name:
 *         type: integer
 *       email:
 *         type: string
 *       username:
 *         type: string
 *       password:
 *         type: string
 *         format: password
 *       resetPasswordToken:
 *         type: string
 *       resetPasswordExpires:
 *         type: string
 *         format: date-time
 *       required:
 *         - email
 *         - username
 *         - password
 */

module.exports = (sequelize, Sequelize) => sequelize.define('ADDRESS_DATA', {
  email : {
    type: Sequelize.STRING,
    primaryKey: true
    },
  networkType: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    identityValue: Sequelize.STRING,
    currencyValue: Sequelize.STRING,
    currencyProxyValue: Sequelize.STRING,
    inventoryProxyValue: Sequelize.STRING,
    tradeValue: Sequelize.STRING,
    deleteFlag: Sequelize.STRING,
    createdBy: Sequelize.STRING,
    modifiedBy: Sequelize.STRING,
  },{
    timestamps: false
  });
