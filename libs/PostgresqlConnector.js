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
        return (
            async () => {
                try {
                    if (!values) {
                        values = [];
                    }
                    const { rows } = await this.pool.query(query, values)
                    return rows;
                } catch (err) {
                    query = query.substring(0, 1000);
                    console.error('Error in Query', query, values);
                    console.error(err);
                    throw err;
                }
            }
        )();
    }


    shutdown() {
        return (
            async () => {
                await this.pool.end();
            }
        )()
    }


}

module.exports.escapeString = escapeString;
module.exports = PostgresqlConnector;

