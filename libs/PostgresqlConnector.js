const { Pool } = require('pg');

var escapeString = function (stringToEscape) {
    if (!stringToEscape) {
        return 'null';
    }
    return '\'' + stringToEscape.replace(/\'/g, '\'\'') + '\'';
};



class PostgresqlConnector {
    constructor(connectionString) {
        this.connectionString = connectionString;
        this.pool = new Pool({
            'connectionString': this.connectionString
        });
        this.pool.on('error', (err, client) => {
            console.error('Unexpected error on idle client', err)
            process.exit(-1);
        });
    }

    query(query, values) {
        return new Promise((resolve, reject) => {
            if (!values) {
                values = [];
            }
            this.pool.connect().then(client => {
                return client.query(query, values).then(res => {
                    client.release();
                    var rows = [];

                    if (res.rows) {
                        rows = res.rows;
                    }
                    return resolve(rows);
                }).catch(err => {
                    client.release();
                    query = query.substring(0, 1000);
                    console.error('Error in Query', query, values);
                    console.error(err);
                    return reject(err);
                });
            }).catch(err => {
                console.error(err);
                return reject(err);
            });
        });
    }


}

module.exports.escapeString = escapeString;
module.exports = PostgresqlConnector;

