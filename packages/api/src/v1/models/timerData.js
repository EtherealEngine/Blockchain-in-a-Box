module.exports = (sequelize, Sequelize) =>
sequelize.define("TIMER_DATA", {
  email: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  startTime: {
    type: Sequelize.DATE,
    default : Date.now(new Date())
  },
  endTime: {
    type: Sequelize.DATE,
    default : Date.now(new Date())
  },
  ratePerMin: {
    type: Sequelize.DOUBLE,
  },
  currency: {
    type: Sequelize.STRING,
  }
},{
    timestamps: false
});