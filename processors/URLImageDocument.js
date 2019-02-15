class URLImageDocument {
    constructor(domain, url, timestamp, images) {

        this.domain = domain;
        this.url = url;
        this.timestamp = timestamp;

        this.images = [];
        if (images)
            this.images = images;

        return this;
    }
}







module.exports = URLImageDocument;