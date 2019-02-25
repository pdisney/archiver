const azure_storage = require('azure-storage');
const STORAGE_ACCOUNT = 'stlgcool1';
const CONTAINER = "hvarchive"


const createContainer = async (blobService, container) => {
    return new Promise((resolve, reject) => {
        blobService.createContainerIfNotExists(container, {  }, err => {
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
        console.info(STORAGE_ACCOUNT, global.AzureCoolKey);
        this.blobService = azure_storage.createBlobService(STORAGE_ACCOUNT, global.AzureCoolKey);
    }

    saveDocument(container, filename, document) {
        return (async () => {
            try {
                console.info(container, filename);
                await createContainer(this.blobService, CONTAINER);
                await upload(this.blobService, CONTAINER, filename, JSON.stringify(document));
            } catch (err) {
                console.error(err);
                throw err;
            }
        })();

    }
}

module.exports = AzureBlobSaver;
