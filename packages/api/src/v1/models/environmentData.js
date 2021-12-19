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

module.exports = (sequelize, Sequelize) => sequelize.define("ENVIRONMENT_DATA", {
    dataKey: {
      type: Sequelize.STRING, 
      primaryKey: true
    },
    dataValue: Sequelize.STRING,
    oldDataValue: Sequelize.STRING,
    deleteFlag: Sequelize.STRING,
    createdBy: Sequelize.STRING,
    modifiedBy: Sequelize.STRING,
  },{
    timestamps: false
  });
