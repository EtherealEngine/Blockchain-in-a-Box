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

module.exports = (sequelize, Sequelize) => sequelize.define('USER_DATA', {
    userEmail: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    userRole: Sequelize.STRING,
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    resetPasswordToken: Sequelize.STRING,
    resetPasswordExpires:{
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
  },{
    timestamps: false
  });
