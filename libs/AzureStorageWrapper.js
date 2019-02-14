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

var getImageStatus = async (containerName, blobname, blobService) => {
	return new Promise((resolve, reject) => {
		blobService.getBlobProperties(containerName, blobname, (err, properties, status) => {
			if (err) {
				console.error("Error downloading image " + err + " " + blobname);
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
				if (imageStatus.isSuccessful) {
					image_details.exists = true;
				} else {
					imageStatus = await getImageStatus(azureStorageProperties.containerName, azureStorageProperties.oldFormatblobname, this.blobService);
					image_details.exists = imageStatus.isSuccessful;
					image_details.blobName = azureStorageProperties.oldFormatblobname;
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

	getImageBuffer(url, harvest_id) {
		return (async () => {
			try {
				var image = await this.getImageStream(url, harvest_id);
				if (image){
					var image_buffer = await rawbody(image);
					return image_buffer.toString('base64');
				} else
					return;
			} catch (err) {
				throw err;
			}
		})();
	}
}


module.exports = AzureStorageWrapper;



