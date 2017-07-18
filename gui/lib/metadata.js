const url = require('url');
const $ = require('jquery');
const Formatter = require('./formatter');

class MetadataFormat {
    constructor(properties) {
        this.properties = properties;
        this.formatter = new Formatter();
        this.container = null;
    }

    get source() {
        return this.properties._source;
    }

    get chips() {
        let c = [];

        this.source.keywords.sort().forEach((x) => {
            c.push({tag: x});
        });

        return c;
    }

    get image() {
        if(!this.source.file) {
            return '#';
        }
        return url.format({
            pathname: this.source.file.path,
            protocol: 'file:',
            slashes: true
        });
    }

    format() {
        return this.formatter.format('./templates/card.html', {
            image: this.image,
            source: this.source
        });
    }

    created() {
        $(this.container).find('.chips').material_chip({
            data: this.chips
        });
        
        $(this.container).on('chip.add', (e, chip) => {
            this.source.keywords.push(chip.tag);
            
            require('./index').getClient().update({
                index: 'media',
                type: 'media',
                id: this.properties._id,
                body: {
                    script: {
                        inline: 'ctx._source.keywords.add(params.tag)',
                        lang: 'painless',
                        params: {
                            tag: chip.tag
                        }
                    }
                }
            }).then((r) => {
                console.info('-- success', r);
            }, (r) => {
                console.warn('-- failure', r);
            });
        });
    }

    update() {
        $(this.container).empty().append(this.format());
        this.created();
    }
}

module.exports = MetadataFormat;
