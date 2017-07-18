require('../shared/extend/promises');

const flatten = require('../shared/extend').flatten;
const config = require('../config.json');
const queue = require('queue');
const _ = require('lodash');
const fs = require('fs');

const Watcher = require('./lib/watcher');
const Metadata = require('./lib/metadata');
const Indexer = require('./lib/indexer');

const watchers = [];
const q = queue({
    autostart: true,
    concurrency: 5
});

q.on('error', (error) => {
    console.error('-- queue:error', error);
});
q.on('timeout', () => {
    console.info('-- queue:timeout');
});
q.on('end', (error) => {
    console.info('-- queue:end', error ? error : '');
});

function handleFileEvent(data) {
    q.push((cb) => {
        let m = new Metadata(data.dir, data.filename);
        m.read()
            .then((metadata) => {
                indexer.exists(metadata)
                    .then((d) => {
                        console.info('-- checksum %s already exists', metadata.get('checksum'), d.id);
                        metadata.cleanData = d.data;

                        if(metadata.isDirty()) {
                            console.info('-- original', flatten(d.data));
                            console.info('-- new', flatten(metadata.data));
                            console.info('-- what is dirty?', metadata.dirty);

                            const script = [];

                            // make script with "dirty"
                            _.keys(metadata.dirty).forEach((key) => {
                                const value = metadata.dirty[key];
                                if(value instanceof Array) {
                                    value.forEach((item) => {
                                        script.push('ctx._source.' + key + '.add(' + JSON.stringify(item) + ');');
                                    });
                                } else {
                                    script.push('ctx._source.' + key + ' = ' + JSON.stringify(value) + ';');
                                }
                            });

                            console.info('-- updating!');

                            indexer.update(metadata, {
                                script: script.join(' '),
                                params: metadata.dirty
                            }, d.id).then((r) => {
                                console.info('-- updated', r);
                                process.exit(-1);
                            }).catch((e) => {
                                console.warn('-- failed to update', e);
                                process.exit(-1);
                            });
                        }

                        /* // skipping updating for now
                        indexer.update(metadata, _id)
                            .finally(() => {
                                cb();
                            });
                        */

                        cb();
                    })
                    .catch(() => {
                        console.info('-- %s does not exist', metadata.get('checksum'));
                        indexer.index(metadata)
                            // @ts-ignore
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

    if (q.length > 0) {
        q.start();
    }
}

const indexer = new Indexer(config);
indexer.on('ready', () => {
    for (let parser in config.parsers) {
        let p = require('./lib/parsers/' + parser);
        let c = config.parsers[parser];

        Metadata.addParser(new p(c));
    }

    for (const dir of config.media.directories) {
        if(fs.existsSync(dir)) {
            watchers.push(new Watcher(dir));
        }
    }

    watchers.forEach((w) => {
        w.on('watcher:rename', handleFileEvent);
        w.on('watcher:change', handleFileEvent);
        w.on('watcher:read', handleFileEvent);

        w.watch().read();
    });
});
