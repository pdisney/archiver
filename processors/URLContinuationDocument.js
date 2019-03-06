class URLContinuationDocument {
    constructor(query, params, document, section) {

       this.query = query;
       this.params = params;
       this.document = document;
       var time = Date.now().toString();
       var timestamp = new Date(document.timestamp).toISOString().substring(0, 10);
       this.filename = this.document.domain + "/" + this.document.domain + "_cont_" + section + "_" + timestamp + "_" + time + ".json";
       this.section = section;
       return this;
    }
}







module.exports = URLContinuationDocument;