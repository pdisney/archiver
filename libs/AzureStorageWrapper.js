const STORAGE_SERVICE = "cishvblob";
const GENERAL_CONTAINER_NAME = 'hv-general';
const CONTAINER_PREFIX = 'hv';
const azure_storage = require('azure-storage');
const rawbody = require('raw-body');
const IMAGE_LARGE = "image_large";


var escapeStringOld = (stringToEscape) => {
	stringToEscape = stringToEscape.replace(/[ ]/g, '+');
	return stringToEscape.replace(/[&#?]/g, '_');
};
var escapeString = (stringToEscape) => {
	return stringToEscape.replace(/[&#?+ ]/g, '_');
};

var getImageFileNameOldFormat = (type, url) => {
	var url = url.replace('http://', '');
	var url = url.replace('https://', '');
	var name = type + '/' + url;
	var lastchar = name.substring(name.length - 1);
	if (lastchar === '/') {
		name = name.substring(0, name.length - 1);
	}
	return escapeStringOld(name);
}

var getImageFileName = (type, url) => {
	var url = url.replace('http://', '');
	var url = url.replace('https://', '');
	var name = type + '/' + url;
	var lastchar = name.substring(name.length - 1);
	if (lastchar === '/') {
		name = name.substring(0, name.length - 1);
	}
	return escapeString(name);

}

var getContainerName = (harvest_id) => {
	var containerName = GENERAL_CONTAINER_NAME;
	if (harvest_id) {
		containerName = CONTAINER_PREFIX + harvest_id;
	}
	return containerName;
}

var getImageStatus = async (container, blobname, blobService) => {
	return new Promise((resolve, reject) => {
		blobService.getBlobProperties(container, blobname, (err, properties, status) => {
			if (err) {
				console.error( err.name, err.message, container, blobname);
			}
			return resolve(status);
		});
	});
}

var getAzureStorageProperties = (url, harvest_id) => {
	var azureProperties = {};
	azureProperties.containerName = getContainerName(harvest_id);
	azureProperties.blobName = getImageFileName(IMAGE_LARGE, url);
	azureProperties.oldFormatblobname = getImageFileNameOldFormat(IMAGE_LARGE, url);
	return azureProperties;
}


var getAzureWriteStream = async (container, filename, content_type) => {
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


const createContainer = async (blobService, container) => {
	return new Promise((resolve, reject) => {
		blobService.createContainerIfNotExists(container, { publicAccessLevel: 'blob' }, err => {
			if (err) {
				reject(err);
			} else {
				resolve({ message: `Container '${container}' created` });
			}
		});
	});
};

var uploadImage = (container, filename, data, content_typ) => {
	return new Promise((resolve, reject) => {

		getAzureWriteStream(container, filename, content_type).then(writeStream => {
			var dataLength = 0;
			stream.on('data', (data) => {
				dataLength += data.length;
				writeStream.write(data);
			});
			stream.on('end', () => {
				writeStream.end();
			});
			stream.on('error', (err) => {
				console.error("AzureWriteStream Error", err);
				return reject(err);
			});
			writeStream.on('error', (err) => {
				return reject(err);
			});
			writeStream.on('end', () => {
				console.info("[AzureWrapper] document streaming to " + containerName + " complete: " + blobname + " dataLength:" + dataLength);
				if (dataLength === 0) {
					deleteBlob(containerName, blobname).then(() => {
						return resolve(0);
					}).catch(err => {
						return reject(err);
					})
				} else {
					return resolve(dataLength);
				}
			});
		});
	}).catch(err => {
		return reject(err);
	});
}

const uploadDocument = async (blobService, container, filename, data) => {
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

const listBlobs = async (container) => {
	return new Promise((resolve, reject) => {
		blobService.listBlobsSegmented(container, null, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve({ message: `${data.entries.length} blobs in '${containerName}'`, blobs: data.entries });
			}
		});
	});
};

const downloadBlob = async (containerName, blobName) => {
	const dowloadFilePath = path.resolve('./' + blobName.replace('.txt', '.downloaded.txt'));
	return new Promise((resolve, reject) => {
		blobService.getBlobToText(containerName, blobName, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve({ message: `Blob downloaded "${data}"`, text: data });
			}
		});
	});
};

const deleteBlob = async (containerName, blobName) => {
	return new Promise((resolve, reject) => {
		blobService.deleteBlobIfExists(containerName, blobName, err => {
			if (err) {
				reject(err);
			} else {
				resolve({ message: `Block blob '${blobName}' deleted` });
			}
		});
	});
};

const deleteContainer = async (containerName) => {
	return new Promise((resolve, reject) => {
		blobService.deleteContainer(containerName, err => {
			if (err) {
				reject(err);
			} else {
				resolve({ message: `Container '${containerName}' deleted` });
			}
		});
	});
};




class AzureStorageWrapper {
	constructor() {
		this.blobService = azure_storage.createBlobService(STORAGE_SERVICE, global.AzureKey);
	}

	checkImageDetails(url, harvest_id) {
		return (async () => {
			try {
				var image_details = {};
				image_details.exists = false;
				var azureStorageProperties = getAzureStorageProperties(url, harvest_id);
				image_details.containerName = azureStorageProperties.containerName;
				image_details.blobName = azureStorageProperties.blobName;

				var imageStatus = await getImageStatus(azureStorageProperties.containerName, azureStorageProperties.blobName, this.blobService);
				if (imageStatus && imageStatus.isSuccessful) {
					image_details.exists = true;
				} else {
					imageStatus = await getImageStatus(azureStorageProperties.containerName, azureStorageProperties.oldFormatblobname, this.blobService);
					if (imageStatus && imageStatus.isSuccessful) {
						image_details.exists = imageStatus.isSuccessful;
						image_details.blobName = azureStorageProperties.oldFormatblobname;
					} else {
						console.info("GENERA",GENERAL_CONTAINER_NAME);
						imageStatus = await getImageStatus(GENERAL_CONTAINER_NAME, azureStorageProperties.blobName, this.blobService);
						if (imageStatus && imageStatus.isSuccessful) {
							image_details.exists = imageStatus.isSuccessful;
							image_details.containerName = GENERAL_CONTAINER_NAME;
						} else {
							imageStatus = await getImageStatus(GENERAL_CONTAINER_NAME, azureStorageProperties.oldFormatblobname, this.blobService);
							if (imageStatus && imageStatus.isSuccessful) {
								image_details.exists = imageStatus.isSuccessful;
								image_details.blobName = azureStorageProperties.oldFormatblobname;
								image_details.containerName = GENERAL_CONTAINER_NAME;
							} else {
								image_details.exists = false;
							}
						}
					}
				}
				return image_details;

			} catch (err) {
				throw err;
			}
		})();
	}


	getImageStream(url, harvest_id) {
		return (async () => {
			try {
				var image_details = await this.checkImageDetails(url, harvest_id);
				if (image_details.exists) {
					return this.blobService.createReadStream(image_details.containerName, image_details.blobName);
				}
				return;
			} catch (err) {
				throw err;
			}
		})();
	}

	getBase64Image(url, harvest_id) {
		return (async () => {
			try {
				var image = await this.getImageStream(url, harvest_id);
				if (image) {
					var image_buffer = await rawbody(image);
					return image_buffer.toString('base64');
				} else
					return;
			} catch (err) {
				throw err;
			}
		})();
	}

	recordFile(container, filename, document) {
		return (async () => {
			try {
				await createContainer(this.blobService, container);
				await uploadDocument(this.blobService, container, filename, JSON.stringify(data));
			} catch (err) {
				console.error(err);
				throw err;
			}
		})();

	}

	recordImage(collection_id, domain, type, url, stream) {
		return (async () => {
			try {
				var url = decodeURIComponent(url);
				var blobname = getImageFileName(domain, type, url);

				//create 2 copies of stream
				var st1 = new pass;
				var st2 = new pass;
				stream.pipe(st1);
				stream.pipe(st2);

				var hv_size = 0;
				//record image to harvest specific collection.
				if (collection_id !== 'general') {
					hv_size = await uploadImage('hv' + collection_id.toString(), blobname, st1);
				}
				var gen_size = await uploadImage(GENERAL_CONTAINER_NAME, blobname, st2);
				return gen_size;
			} catch (err) {
				throw err;
			}
		})();

	}
}


module.exports = AzureStorageWrapper;



