const Exif = require('exif');

class ExifParser {
    /**
     * [[Description]]
     * @param   {Metadata} metadata [[Description]]
     * @returns {Promise} [[Description]]
     */
    parse(metadata) {
        return new Promise((resolve, reject) => {
            const image = new Exif({
                image: metadata.getFilePath()
            }, (error, data) => {
                if (error) {
                    if (error.code == 'NO_EXIF_SEGMENT' || error.code == 'NOT_A_JPEG') {
                        resolve();
                    } else {
                        reject(error);
                    }
                } else {
                    for (const key in data.exif) {
                        if (data.exif.hasOwnProperty(key) && data.exif[key] instanceof Buffer) {
                            data.exif[key] = data.exif[key].toString('utf8');
                        }
                    }

                    metadata.set('exif', data);

                    resolve();
                }
            });
        });
    }
}

module.exports = ExifParser;
