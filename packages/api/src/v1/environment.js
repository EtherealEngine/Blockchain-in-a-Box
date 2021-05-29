const development = !process.env.PRODUCTION
const production = process != undefined && process.env.PRODUCTION

module.exports = {
    development,
    production
}