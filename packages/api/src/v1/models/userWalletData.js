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

module.exports = (sequelize, Sequelize) => sequelize.define('USER_WALLET_DATA', {
    userId: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    userMnemonic: Sequelize.STRING,
    userAddress: Sequelize.STRING,
    userPrivateKey: Sequelize.STRING,
  },{
    timestamps: false
  });
