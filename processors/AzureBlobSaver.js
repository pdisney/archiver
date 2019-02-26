const azure_storage = require('azure-storage');
var Readable = require('stream').Readable;


const createContainer = async (blobService, container) => {
    return new Promise((resolve, reject) => {
        blobService.createContainerIfNotExists(container, {}, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Container '${container}' created` });
            }
        });
    });
};

const getAzureWriteStream = async (blobService, container, filename, content_type) => {
    return new Promise((resolve) => {
        return resolve(blobService.createWriteStreamToBlockBlob(
            container,
            filename,
            { contentType: content_type },//content_type'image/jpeg' },
            (err, result, response) => {
                if (err) {
                    console.error("Couldn't upload file %s ", filename, err);

                } else {
                    console.debug('File %s uploaded to ', filename, container);
                }
            }));
    });
}

const deleteBlob = async (blobService, container, filename) => {
    return new Promise((resolve, reject) => {
        blobService.deleteBlobIfExists(container, filename, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ message: `Block blob '${filename}' deleted` });
            }
        });
    });
};

var uploadFile = (blobService, container, filename, document, content_type) => {
    return new Promise((resolve, reject) => {

        var documentStream = new Readable();
        documentStream.push(document);
        documentStream.push(null);

        getAzureWriteStream(blobService, container, filename, content_type).then(writeStream => {

            var dataLength = 0;
            documentStream.on('data', (data) => {
                dataLength += data.length;
                writeStream.write(data);
            });
            documentStream.on('end', () => {
                writeStream.end();
            });
            documentStream.on('error', (err) => {
                console.error("AzureWriteStream Error", err);
                return reject(err);
            });

            writeStream.on('error', (err) => {
                return reject(err);
            });
            writeStream.on('end', () => {
                console.info("[AzureUpload] Image streaming to " + container + " complete: " + filename + " dataLength:" + dataLength);
                if (dataLength === 0) {
                    deleteBlob(blobService, container, filename).then(() => {
                        return resolve(0);
                    }).catch(err => {
                        return reject(err);
                    })
                } else {
                    return resolve(dataLength);
                }
            });
        });
    });
}
/*
const upload = (blobService, container, filename, data) => {
    return new Promise((resolve, reject) => {
       blobService.createBlockBlobFromText(container, filename, data, err => {
            if (err) {
                reject(err);
            } else {
                resolve({ "message": `Document "${data.url}" is written to blob storage` });
            }
        });
    });
};
*/


class AzureBlobSaver {
    constructor() {
        this.blobService = azure_storage.createBlobService(global.AzureCoolStorageAccount, global.AzureCoolKey);
    }

    saveDocument(filename, document) {
        return (async () => {
            try {
                await createContainer(this.blobService, global.AzureCoolBucket);
                await uploadFile(this.blobService, global.AzureCoolBucket, filename, JSON.stringify(document), "application/json");
            } catch (err) {
                console.error(err);
                throw err;
            }
        })();

    }
}

module.exports = AzureBlobSaver;
