const checksum = require('checksum');

class Checksum {
    /**
     * [[Description]]
     * @param   {Metadata} metadata [[Description]]
     * @returns {Promise} [[Description]]
     */
    static parse(metadata) {
        return new Promise((resolve, reject) => {
            checksum.file(metadata.getFilePath(), (err, sum) => {
                if(err) {
                    reject(err);
                }

                metadata.set('checksum', sum);

                resolve();
            });
        });
    }
}

module.exports = Checksum;
