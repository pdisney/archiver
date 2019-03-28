const expect = require('chai').expect;
const PostgresqlConnector = require('../PostgresqlConnector');



var sleep = (time) => {
    return new Promise(resolve => {
        setTimeout(() => {
            return resolve();
        }, time);
    });
}

describe('#RabbitConnector', function () {
    this.timeout(720000);
    let postgres;
    beforeEach(async function () {
        postgres = await new PostgresqlConnector("postgres://admin:c1s-Adm1n@cis-reference.cloudapp.net/cis-harvester-production");

    });
    afterEach(async function () {
        await postgres.shutdown();
    });

//cover standard html error codes returned from server 
    it('Test query', async function () {
        var rows = await postgres.query("select * from harvests where id = $1", [90]);
        expect(rows[0].id).to.be.eql(90);

    });
    it('Test query no values', async function () {
        var rows = await postgres.query("select * from harvests LIMIT 1");
     
        expect(rows[0].id).to.be.eql(136);
    });

    it('Test query no results', async function () {
        var rows = await postgres.query("select * from harvests WHERE id = $1",[1234566]);
        expect(rows.length).to.be.eql(0);
    });


});