require("dotenv").config()

module.exports = {
    development: {
        username: process.env.DB_U,
        password: process.env.DB_PASSWORD,
        database: process.env.DATABASE,
        host:process.env.DB_HOST,
        port:process.env.DB_PORT
    }
}
