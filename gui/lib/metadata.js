const url = require('url');

class Metadata {
    constructor(properties) {
        this.properties = properties;
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
        return `
        <div class="col s6 m4 l3">
            <div class="card hoverable">
                <div class="card-image">
                    <img src="${this.image}" class="materialboxed">
                    <span class="card-title truncate">${this.source.file.name}</span>
                </div>
                <div class="card-content">
                    <p class="truncate">${this.source.checksum}</p>
                </div>
            </div>
        </div>`;
    }
}

module.exports = Metadata;
