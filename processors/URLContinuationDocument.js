class URLContinuationDocument {
    constructor(query, params, document, section) {

       this.query = query;
       this.params = params;
       this.document = document;
       var time = Date.now().toString();
       this.filename = this.document.domain + "/" + this.document.domain + "_cont_" + section + "_" + this.document.timestamp + "_" + time + ".json";
       this.section = section;
       return this;
    }
}







module.exports = URLContinuationDocument;