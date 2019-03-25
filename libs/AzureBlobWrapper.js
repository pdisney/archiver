
const azure_storage = require('azure-storage');
var Readable = require('stream').Readable;



var getBlobStatus = async (containerName, blobname, blobService) => {
	return new Promise((resolve, reject) => {
		blobService.getBlobProperties(containerName, blobname, (err, properties, status) => {
			if (err) {
				console.debug(err.name, err.message, containerName, blobname);
			}
			return resolve(status);
		});
	});
}

const uploadBlob = async (containerName, blobName, data, blobService) => {
	return new Promise((resolve, reject) => {
		blobService.createBlockBlobFromText(containerName, blobName, data, err => {
			if (err) {
				reject(err);
			} else {
				resolve({ "message": 'Document "${data.url}" is written to blob storage' });
			}
		});
	});
};

const getAzureWriteStream = async (blobService, containerName, blobName, content_type) => {
	return new Promise((resolve) => {
		return resolve(blobService.createWriteStreamToBlockBlob(
			containerName,
			blobName,
			{ contentType: content_type },
			(err, result, response) => {
				if (err) {
					console.error("Couldn't upload file %s ", blobName, err);

				} else {
					console.debug('File %s uploaded to ', blobName, containerName);
				}
			}));
	});
}

var streamUploadBlob = (containerName, blobName, data, content_type, blobService) => {
	return new Promise((resolve, reject) => {


		var documentStream = new Readable();
		documentStream.push(data);
		documentStream.push(null);

		getAzureWriteStream(blobService, containerName, blobName, content_type).then(writeStream => {

			var dataLength = 0;
			documentStream.on('data', (d) => {
				dataLength += d.length;
				writeStream.write(d);
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
				console.info("[AzureUpload] document streaming to " + containerName + " complete: " + blobName + " dataLength:" + dataLength);
				if (dataLength === 0) {
					deleteBlob(blobService, containerName, blobName).then(() => {
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



const createContainer = async (containerName, blobService) => {
	return new Promise((resolve, reject) => {
		blobService.createContainerIfNotExists(containerName, { publicAccessLevel: 'blob' }, err => {
			if (err) {
				reject(err);
			} else {
				resolve({ message: `Container '${containerName}' created` });
			}
		});
	});
};



const listBlobsWithPrefix = async (containerName, prefix, blobService, continuationToken) => {
	return new Promise((resolve, reject) => {
		blobService.listBlobsSegmentedWithPrefix(containerName, prefix, continuationToken, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

const getNames = (blobs) => {
	var names = [];
	for (var i = 0; i < blobs.length; i++) {
		names.push(blobs[i].name);
	}
	return names;
}

var aggregateWithPrefix = async (containerName, prefix, blobs, blobService, limit, continuationToken) => {
	try {
		var newblobs = await listBlobsWithPrefix(containerName, prefix, blobService, continuationToken);
		blobs = blobs.concat(newblobs.entries);
		if (blobs.length >= limit) {
			var slice = blobs.slice(0, limit);
			var names = getNames(slice);
			return names;
		} else {
			if (newblobs.continuationToken !== null) {
				return await aggregateWithPrefix(containerName, prefix, blobs, blobService, limit, continuationToken);
			} else {
				var names = getNames(blobs);
				return names;
			}
		}
	} catch (err) {
		throw err;
	}

}

const listBlobs = async (containerName, blobService, continuationToken) => {
	return new Promise((resolve, reject) => {
		blobService.listBlobsSegmented(containerName, continuationToken, (err, data) => {
			if (err) {
				reject(err);
			} else {

				resolve(data);
			}
		});
	});
};



const aggregateBlobs = async (containerName, blobService, blobs, continuationToken, limit) => {
	try {

		var newblobs = await listBlobs(containerName, blobService, continuationToken);
		blobs = blobs.concat(newblobs.entries);
		if (newblobs.continuationToken !== null) {
			if (limit) {
				if (blobs.entries.length < limit) {
					aggregateBlobs(containerName, blobService, blobs, newblobs.continuationToken, limit);
				} else {
					return blobs;
				}
			} else {
				aggregateBlobs(containerName, blobService, blobs, newblobs.continuationToken, limit);
			}
		} else {
			return blobs;
		}
	} catch (err) {
		throw err;
	}
}

const downloadBlob = async (containerName, blobName, blobService) => {
	//const dowloadFilePath = path.resolve('./' + blobName.replace('.txt', '.downloaded.txt'));
	return new Promise((resolve, reject) => {
		blobService.getBlobToText(containerName, blobName, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

const deleteBlob = async (containerName, blobName, blobService) => {
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

const deleteContainer = async (containerName, blobService) => {
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




class AzureBlobWrapper {
	constructor(storage_service, azure_key) {
		this.blobService = azure_storage.createBlobService(storage_service, azure_key);
	}

	listBlobs(containerName) {
		return (async () => {
			try {
				return await listBlobs(containerName, this.blobService);
			} catch (err) {
				throw err;
			}
		})();
	}

	uploadBlob(containerName, blobName, data) {
		return (async () => {
			try {
				return await uploadBlob(containerName, blobName, data, this.blobService);
			} catch (err) {
				throw err;
			}
		})();
	}


	uploadBlobStream(containerName, blobName, data, content_type) {
		return (async () => {
			try {
				await createContainer(containerName, this.blobService);
				var status = await getBlobStatus(containerName, blobName, this.blobService);
				if (!status.isSuccessful) {
					await streamUploadBlob(containerName, blobName, JSON.stringify(data), content_type, this.blobService);
				}
			} catch (err) {
				console.error(err);
				throw err;
			}
		})();

	}

	getBlobStream(containerName, blobName) {
		return (async () => {
			try {
				return this.blobService.createReadStream(containerName, blobName);
			} catch (err) {
				throw err;
			}
		})();
	}

	getBlob(containerName, blobName) {
		return (async () => {
			try {
				return await downloadBlob(containerName, blobName, this.blobService);
			} catch (err) {
				throw err;
			}
		})();
	}

	getBlobStatus(containerName, blobName) {
		return (async () => {
			try {
				return await getBlobStatus(containerName, blobName, this.blobService);
			} catch (err) {
				throw err;
			}
		})();
	}

	createContainer(containerName) {
		return (async () => {
			try {
				return await createContainer(containerName, this.blobService);
			} catch (err) {
				throw err;
			}
		})();
	}

	deleteContainer(containerName) {
		return (async () => {
			try {
				return await deleteContainer(containerName, this.blobService);
			} catch (err) {
				throw err;
			}
		})();
	}

	deleteBlob(containerName, blobName) {
		return (async () => {
			try {
				return await deleteBlob(containerName, blobName, this.blobService);
			} catch (err) {
				throw err;
			}
		})();
	}




	getBlobsByPrefix(containerName, prefix, limit) {
		return (async () => {
			try {
				return await aggregateWithPrefix(containerName, prefix, [], this.blobService, limit, null);
			} catch (err) {
				throw err;
			}
		})();

	}


}


module.exports = AzureBlobWrapper;




