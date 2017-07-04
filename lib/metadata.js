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
        for(const parser in parsers) {
            parselist.push(parsers.parse(this));
        }

        Promise.all(parselist)
            .then(() => {
            console.info('-- metadata:read', 'finished');
        }).catch((e) => {
            console.error('-- metadata:read', e);
        });
    }

    set(key, value) {
        this.data[key] = value;
    }

    get(key) {
        return this.data[key];
    }

    getFilePath() {
        return this.dir + '/' + this.file;
    }
}

module.exports = Metadata;
