

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
            this.links = [];
            if(html.length>0){
                if(html.length>global.config.html_char_limit){
                    console.info(url,'exceeded the HTML character limit of',html.length,"characters. Truncating to ",global.config.html_char_limit,"characters for Tag Retrieval.")
                    html = html.substr(0,global.config.html_char_limit);
                }
                this.links = await global.html_analyzer.getAllTags(url, html, global.config.tag_limit);
            }
            this.html = html;
            return this;
        })();
    }
}







module.exports = URLDocument;