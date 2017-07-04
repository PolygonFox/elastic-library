require('./lib/extend/promises');

const config = require('./config.json');
const elastic = require('elasticsearch');
const queue = require('queue');

const Watcher = require('./lib/watcher');
const Metadata = require('./lib/metadata');
const Indexer = require('./lib/indexer');

const watchers = [];
const q = queue({
    autostart: true,
    concurrently: 5
});

const indexer = new Indexer(config);
indexer.on('ready', () => {
    for (let parser in config.parsers) {
        let p = require('./lib/parsers/' + parser);
        let c = config.parsers[parser];

        Metadata.addParser(new p(c));
    }

    for (const dir of config.media.directories) {
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
            q.push((cb) => {
                let m = new Metadata(data.dir, data.filename);
                m.read()
                    .then((metadata) => {
                        indexer.exists(metadata)
                            .then(() => {
                                console.info('-- checksum %s already exists', metadata.get('checksum'));
                                cb();
                            })
                            .catch(() => {
                                indexer.index(metadata)
                                    .finally(() => {
                                        cb();
                                    });
                            });
                    })
                    .catch((e) => {
                        console.error('-- metadata:error', e);
                        cb();
                    });
            });
        });

        w.watch().read();
    });
});
