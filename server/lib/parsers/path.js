const path = require('path');

class PathParser {
    constructor(config) {
        this.config = config;
    }

    /**
     * @param {Metadata} metadata
     * @returns {Promise}
     */
    parse(metadata) {
        return new Promise((resolve) => {
            let pathdata = path.parse(metadata.getFilePath());

            let dirs = pathdata.dir.split(path.sep).filter((i) => {
                return this.config.ignore.indexOf(i) === -1 && i !== '';
            });

            metadata.set('file.name', pathdata.name);
            metadata.set('file.extension', pathdata.ext);
            metadata.set('file.filename', pathdata.name + pathdata.ext);
            metadata.set('file.path', metadata.getFilePath());

            metadata.add('keywords', dirs);

            resolve();
        });
    }
}

module.exports = PathParser;
