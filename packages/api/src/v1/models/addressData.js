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
  NETWORK_TYPE: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    IDENTITY_VALUE: Sequelize.STRING,
    CURRENCY_VALUE: Sequelize.STRING,
    CURRENCY_PROXY_VALUE: Sequelize.STRING,
    INVENTORY_PROXY_VALUE: Sequelize.STRING,
    TRADE_VALUE: Sequelize.STRING,
    DELETE_FLAG: Sequelize.STRING,
    CREATED_BY: Sequelize.STRING,
    MODIFIED_BY: Sequelize.STRING,
    /*CREATED_ON: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
    MODIFIED_ON: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },*/
  });
