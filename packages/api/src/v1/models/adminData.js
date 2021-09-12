/**
 * @swagger
 * definitions:
 *   ADMIN_DATA:
 *     type: object
 *     properties:
 *       EMAIL:
 *         type: string
 *       TOKEN:
 *         type: string
 *       required:
 *         - EMAIL
 *         - TOKEN
 */

module.exports = (sequelize, Sequelize) =>
  sequelize.define("ADMIN_DATA", {
    email: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    organizationName: {
      type: Sequelize.STRING,
    }
  },{
      timestamps: false
  });
