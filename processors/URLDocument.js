
const link_extractor = require('../libs/link_extractor/link_extractor');



class URLDocument {
    constructor(domain, url, timestamp, ipAddresses, html, ocr, entities, products, relationships) {
        return (async()=>{
            this.domain = domain;
            this.url = url;
            this.timestamp = timestamp;
            this.ipAddresses = [];
            if (ipAddresses)
                this.ipAddresses = ipAddresses;
            this.ocr = [];
            if (ocr)
                this.ocr = ocr;
           
            this.entities = [];
            if (entities)
                this.entities = entities;
            this.products = [];
            if (products)
                this.products = products;
            this.relationships = [];
            if (relationships)
                this.relationships = relationships;
            this.links = await link_extractor.getAllLinks(url, html);
            this.html = html;
            return this;
        })();
    }
}







module.exports = URLDocument;