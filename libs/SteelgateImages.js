const CONTAINER_PREFIX = 'hv';
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
    var containerName = global.AzureImageGeneralContainer;
    if (harvest_id) {
        containerName = CONTAINER_PREFIX + harvest_id;
    }
    return containerName;
}


var getAzureProperties = (url, harvest_id) => {
    var azureProperties = {};
    azureProperties.containerName = getContainerName(harvest_id);
    azureProperties.blobName = getImageFileName(IMAGE_LARGE, url);
    azureProperties.oldFormatblobname = getImageFileNameOldFormat(IMAGE_LARGE, url);
    return azureProperties;
}

class SteelgateImages {
    constructor() {

    }

    checkImageDetails(url, harvest_id) {
        return (async () => {
            try {
                var image_details = {};
                image_details.exists = false;
                var azure_properties = getAzureProperties(url, harvest_id);
                image_details.containerName = azure_properties.containerName;
                image_details.blobName = azure_properties.blobName;

                var imageStatus = await global.azureImage.getBlobStatus(azure_properties.containerName, azure_properties.blobName);
                if (imageStatus && imageStatus.isSuccessful) {
                    image_details.exists = true;
                } else {
                    imageStatus = await global.azureImage.getBlobStatus(azure_properties.containerName, azure_properties.oldFormatblobname);
                    if (imageStatus && imageStatus.isSuccessful) {
                        image_details.exists = imageStatus.isSuccessful;
                        image_details.blobName = azure_properties.oldFormatblobname;
                    } else {
                        imageStatus = await global.azureImage.getBlobStatus(global.AzureImageGeneralContainer, azure_properties.blobName);
                        if (imageStatus && imageStatus.isSuccessful) {
                            image_details.exists = imageStatus.isSuccessful;
                            image_details.containerName = global.AzureImageGeneralContainer;
                        } else {
                            imageStatus = await global.azureImage.getBlobStatus(global.AzureImageGeneralContainer, azure_properties.oldFormatblobname);
                            if (imageStatus && imageStatus.isSuccessful) {
                                image_details.exists = imageStatus.isSuccessful;
                                image_details.blobName = azure_properties.oldFormatblobname;
                                image_details.containerName = global.AzureImageGeneralContainer;
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
                    return global.azureImage.getBlobStream(image_details.containerName, image_details.blobName);
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


}


module.exports = SteelgateImages;