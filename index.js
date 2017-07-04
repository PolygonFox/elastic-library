const config = require('./config.json');
const elastic = require('elasticsearch');

const Watcher = require('./lib/watcher');
const Metadata = require('./lib/metadata');

const client = new elastic.Client(config.search);

let watchers = [];

function init() {
    for( const dir of config.media.directories ) {
        watchers.push(new Watcher(dir));
    }

    watchers.forEach((w) => {

        w.on('watcher:rename', (data) => {
            console.info('watcher:rename', data);
        });
        w.on('watcher:change', (data) => {
            console.info('watcher:change', data);
        });
        w.on('watcher:read', (data) => {
            console.info('watcher:read', data);
        });

        w.watch().read();
    });
}

client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 1000
}).then(() => {

    console.info('-- cluster is alive');

    client.indices.create({
        index: config.index,
        body: {
            settings: {
                number_of_shards: 1
            },
            mappings: {
                media: {
                    properties: {
                        keywords: {
                            type: 'text'
                        },
                        md5: {
                            type: 'text'
                        }
                    }
                }
            }
        }
    }).then(() => {
        console.info('-- index created');
    }).catch(() => {
        console.warn('-- index already exists');
    }).finally(() => {
        console.info('-- nothing?', arguments);
        init();
    });

}).catch(() => {

    console.warn('-- cluster is down!');
    process.exit(-1);

});
