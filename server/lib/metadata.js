const _ = require('lodash');
const flatten = require('../../shared/extend').flatten;

const parsers = [];

class Metadata {
    constructor(dir, file) {
        this.dir = dir;
        this.file = file;
        this.data = {};
        this.cleanData = {};
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

            console.info('-- starting parsing');
            Promise.all(parselist)
                .then(() => {
                    console.info('-- finished parsing');
                    resolve(this);
                }).catch((e) => {
                    console.info('-- error while parsing', e);
                    reject(e);
                });
        });
    }

    has(key) {
        return _.has(this.data, key);
    }

    set(key, value) {
        if(value instanceof String) {
            value = value.toString();
        }

        _.set(this.data, key, value);
    }

    add(key, value) {
        let v = this.get(key);
        if(!v) {
            v = [];
        }
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

    check() {
        // check data
        if(!this.has('keywords')) {
            this.set('keywords', []);
        }
    }

    get dirty() {
        const dirty = {};

        const _new = flatten(this.data);
        const _old = flatten(this.cleanData);

        const _keys = _.merge(_.keys(_old), _.keys(_new));

        for(const key of _keys) {
            if(_new[key] instanceof Array) {
                // own check
                if(!_new[key].compare(_old[key])) {
                    dirty[key] = _new[key];
                }
            } else if(_new[key] != _old[key]) {
                dirty[key] = _new[key];
            }
        }

        return dirty;
    }

    isDirty() {
        return _.keys(this.dirty).length > 0;
    }

    get search() {
        this.check();

        return this.data;
    }
}

module.exports = Metadata;
