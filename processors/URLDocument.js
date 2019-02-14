class URLDocument{
    constructor(domain, url, timestamp, ipAddresses, html, ocr, images, entities, products, relationships, links){
        
        this.domain = domain;
        this.url = url, 
        this.timestamp = timestamp;
        this.ipAddresses=[];
        if(ipAddresses)
            this.ipAddresses = ipAddresses;
        this.ocr =[];
        if(ocr)
            this.ocr = ocr;
        this.images=[];
        if(images)
            this.images= images;
        this.entities=[];
        if(entities)
            this.entities= entities;
        this.products=[];
        if(products)
            this.products = products;
        this.relationships=[];
        if(relationships)
            this.relationships=relationships;
        this.links = links;
        this.html = html;
        return this;
    }
}







module.exports = URLDocument;