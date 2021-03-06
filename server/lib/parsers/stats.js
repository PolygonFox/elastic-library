const fs = require('fs');

/**
 * @class StatsParser
 */
class StatsParser {
    /**
     * @param {Metadata} metadata 
     * @memberof StatsParser
     * @returns {Promise}
     */
    parse(metadata) {
        return new Promise((resolve, reject) => {
            fs.stat(metadata.getFilePath(), (err, stats) => {
                if(err) {
                    reject(err);
                }

                metadata.set('file.created_at', stats.birthtime);
                metadata.set('file.updated_at', stats.mtime);
                metadata.set('file.size', stats.size);

                resolve();
            });
        });
    }
}

module.exports = StatsParser;