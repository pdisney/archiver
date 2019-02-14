const expect = require('chai').expect;
const PostgresqlConnector = require('../libs/PostgresqlConnector');
const DocumentCreator = require('../processors/DocumentManager');
const fs = require('fs');


var writeFile = (fullpath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(fullpath, data, err => {
      if (err) {
        console.info(err);
        return reject(err);
      }

      return resolve();
    });
  })
}

let connector;

describe('UrlDocument test', function () {
    this.timeout(720000);



    it('Test constructor', async function () {
       // var connection_string =
        connector = new PostgresqlConnector(connection_string);

      var query = "SELECT urls.id as url_id, domains.domain_id, domains.harvest_id  FROM urls INNER JOIN(SELECT domains.id as domain_id, harvest_id FROM domains WHERE harvest_id = 93)domains ON domains.domain_id = urls.domain_id order by urls.id LIMIT 10;"
        
        var urls = await connector.query(query);
        console.info("retrieved urls", urls.length);

        for(var i=0;i<urls.length;i++){
            var url = urls[i];
            var creator = new DocumentCreator(url.harvest_id, url.domain_id, url.url_id, connector);
            console.info("creating document");
            var document = await creator.createDocument();
            console.info("writing document");
            await writeFile(__dirname+'/'+document.domain+'_'+i+'.json', JSON.stringify(document));
    
    
            for(var x=0;x<document.images.length;x++){
                var image = document.images[x];
                await writeFile(__dirname+'/'+document.domain+"_"+x+'.png', image.image);
            }
        }
       
    

    });


});
