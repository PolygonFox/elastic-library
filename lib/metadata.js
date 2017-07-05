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
        return new Promise((resolve, reject) => {

            // normal parsers
            let parselist = [];
            for (const parser of parsers) {
                parselist.push(parser.parse(this));
            }

            Promise.all(parselist)
                .then(() => {
                    resolve(this);
                }).catch((e) => {
                    reject(e);
                });
        });
    }

    set(key, value) {
        _.set(this.data, key, value);
    }

    add(key, value) {
        let v = this.get(key);
        if (v instanceof Array) {
            v = value instanceof Array ? _.concat(v, value) : v.push(value);
        }
        this.set(key, v);
    }

    get(key) {
        return _.get(this.data, key);
    }

    getFilePath() {
        return this.dir + '/' + this.file;
    }

    get search() {
        return this.data;
    }
}

module.exports = Metadata;
