const url = require('url');
const _ = require('lodash');
const Formatter = require('./formatter');

class SlideshowFormatter {
    constructor(properties) {
        this.properties = properties;
        this.formatter = new Formatter();
    }

    get source() {
        return this.properties._source;
    }

    get image() {
        if(!this.source.file) {
            return '#';
        }
        return url.format({
            pathname: this.source.file.path,
            protocol: 'file:',
            slashes: true
        })
    }

    format() {
        return this.formatter.format('./templates/slide.html', {
            image: this.image,
            source: this.source
        });
    }
}

module.exports = SlideshowFormatter;