const _ = require('lodash');

const parsers = [];

class Metadata {
    constructor(dir, file) {
        this.dir = dir;
        this.file = file;
        this.data = {};
    }

    static addParser(parser) {
        parsers.push(parser);
    }

    read() {
        // normal parsers
        let parselist = [];
        for (const parser of parsers) {
            parselist.push(parser.parse(this));
        }

        Promise.all(parselist)
            .then(() => {
                console.info('-- metadata:finished', this.data);
            }).catch((e) => {
                console.error('-- metadata:error', e);
            });
    }

    set(key, value) {
        _.set(this.data, key, value);
    }

    get(key) {
        return _.get(this.data, key);
    }

    getFilePath() {
        return this.dir + '/' + this.file;
    }
}

module.exports = Metadata;
