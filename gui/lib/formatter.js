const Mark = require('markup-js');
const fs = require('fs');

const cache = {};

class Formatter {

    template(path) {
        try {
            let filename = require.resolve(path);
            if(cache[filename]) {
                return cache[filename];
            }
            return cache[filename] = fs.readFileSync(filename, 'utf8');
        } catch(e) {
            console.trace(e);
        }
    }

    format(template, data) {
        let t = this.template(template);
        return Mark.up(t, data);
    }

}

module.exports = Formatter;
