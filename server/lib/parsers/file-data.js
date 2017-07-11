const Base64Img = require('base64-img');

class FileDataParser {
    /**
     * [[Description]]
     * @param   {Metadata} metadata [[Description]]
     * @returns {Promise} [[Description]]
     */
    parse(metadata) {
        return new Promise((resolve, reject) => {

            Base64Img.base64(metadata.getFilePath(), (err, data) => {
                if (!err) {
                    metadata.set('file.data', data);
                }

                resolve();
            });
        });
    }
}

module.exports = FileDataParser;
