const aws = require('aws-sdk');


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
    saveDocument(key, document) {
        return (async () => {
            try {

                var params = { "Bucket": global.S3Bucket, "Key": key, "Body": JSON.stringify(document) };

                await upload(params, this.s3);

                return;

            } catch (err) {
                console.error(err);
                throw err;
            }
        })();
    }

}

module.exports = S3Saver;
