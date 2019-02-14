const expect = require('chai').expect;
const PostgresqlConnector = require('../libs/PostgresqlConnector');



describe('PostgresqlConnector test', function () {
    this.timeout(720000);
        it('Test constructor', async function () {
            var connection_string = "postgres://admin@localhost/harvest";
            var connector = new PostgresqlConnector(connection_string);
           
            expect(connector.connectionString).is.eql(connection_string);
           
        });
       
        it('Test query no params', async function () {
            var connection_string = "postgres://admin@localhost/harvest";
            var connector = new PostgresqlConnector(connection_string);
            var query = "SELECT * FROM harvests";
            var result = await connector.query(query);

            expect(result.length).to.be.gte(1);
           
        });
        it('Test query with params', async function () {
            var connection_string = "postgres://admin@localhost/harvest";
            var connector = new PostgresqlConnector(connection_string);
            var query = "SELECT * FROM harvests limit $1";
            var params = [1]
            var result = await connector.query(query, params);

            expect(result.length).to.be.eql(1);
           
        });
       
    
});
