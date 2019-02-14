const aws = require('aws-sdk');
const URL = require('url');


var upload = (params, s3) => {
    return new Promise((resolve, reject) => {
        s3.putObject(params, (err, data) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            console.info("Successfully uploaded data to", params.Bucket, params.Key);
            return resolve();
        });
    });
}


class S3Saver {
    constructor() {
        aws.config.update({
            secretAccessKey: global.SecretKey,
            accessKeyId: global.AccessKey,
            region: global.Region
        });
        this.s3 = new aws.S3();

    }
    saveDocument(document, S3Bucket) {
        return (async () => {
            try {
                var url = URL.parse(document.url);

                var time = Date.now().toString();

                var filename = url.hostname + "/" + url.hostname + "_" + time + ".json";

                var params = { "Bucket": S3Bucket, "Key": filename, "Body": JSON.stringify(document) };

                await upload(params, this.s3);

            } catch (err) {
                console.error(err);
                throw err;
            }
        })();
    }

}

module.exports = S3Saver;
