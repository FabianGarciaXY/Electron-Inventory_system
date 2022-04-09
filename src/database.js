const mysql = require('promise-mysql')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Radiohead4152_',
    database: 'ha_colors'

})

function getConnection() {
    return connection
}

module.exports = {
    getConnection
}