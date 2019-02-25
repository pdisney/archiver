const azure_storage = require('azure-storage');


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

const upload = async (blobService, container, filename, data) => {
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



class AzureBlobSaver {
    constructor() {
        this.blobService = azure_storage.createBlobService(global.AzureCoolStorageAccount, global.AzureCoolKey);
    }

    saveDocument(filename, document) {
        return (async () => {
            try {
                await createContainer(this.blobService, global.AzureCoolBucket);
                await upload(this.blobService, global.AzureCoolBucket, filename, JSON.stringify(document));
            } catch (err) {
                console.error(err);
                throw err;
            }
        })();

    }
}

module.exports = AzureBlobSaver;
