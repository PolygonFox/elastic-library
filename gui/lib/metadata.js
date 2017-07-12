const url = require('url');
const _ = require('lodash');
const Formatter = require('./formatter');

class MetadataFormat {
    constructor(properties) {
        this.properties = properties;
        this.formatter = new Formatter();
    }

    get source() {
        return this.properties._source;
    }

    get image() {
        return url.format({
            pathname: this.source.file.path,
            protocol: 'file:',
            slashes: true
        })
    }

    format() {
        return this.formatter.format('./templates/card.html', {
            image: this.image,
            source: this.source
        });
    }
}

module.exports = MetadataFormat;
