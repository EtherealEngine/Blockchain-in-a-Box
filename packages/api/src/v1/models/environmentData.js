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

module.exports = (sequelize, Sequelize) => sequelize.define('ENVIRONMENT_DATA', {
    DATA_KEY: Sequelize.STRING,
    DATA_VALUE: Sequelize.STRING,
    OLD_DATA_VALUE: Sequelize.STRING,
    DELETE_FLAG: Sequelize.STRING,
    CREATED_BY: Sequelize.STRING,
    MODIFIED_BY: Sequelize.STRING,
    CREATED_ON: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
    MODIFIED_ON: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
  });
