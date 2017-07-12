const elastic = require('elasticsearch');
const events = require('events');

class Indexer extends events.EventEmitter {

    constructor(config) {
        super();

        this._index = config.index;
        this._mapping = config.mapping;
        this._client = new elastic.Client(config.search);

        this._client.ping({
            // ping usually has a 3000ms timeout
            requestTimeout: 1000
        }).then(() => {

            console.info('-- cluster is alive');
            this.createIndex();

        }).catch((e) => {

            console.warn('-- cluster is down!', e);
            process.exit(-1);

        });
    }

    createIndex() {
        this._client.indices.create({
            index: this._index,
            body: {
                settings: {
                    number_of_shards: 2
                },
                mappings: this._mapping
            }
        }).then(() => {
            console.info('-- index created');
        }).catch(() => {
            console.warn('-- index already exists');
        }).finally(() => {
            console.info('-- initiation');

            this.emit('ready');
        });
    }

    /**
     * 
     * @param Metadata metadata 
     * @returns {Promise} 
     */
    index(metadata) {
        return new Promise((resolve, reject) => {
            this._client.index({
                index: this._index,
                type: 'media',
                body: metadata.search
            }).then((r) => {
                console.info('-- indexed', metadata.get('file.name'));
                resolve(metadata);
            }).catch((e) => {
                console.error('-- not indexed', metadata.search, e);

                process.exit(-1);
                
                reject();
            });
        });
    }

    /**
     * 
     * @param Metadata metadata 
     * @returns {Promise} 
     */
    update(metadata, id) {
        return new Promise((resolve, reject) => {
            this._client.index({
                index: this._index,
                type: 'media',
                id: id,
                body: {
                    doc: metadata.search
                }
            }).then((r) => {
                console.info('-- updated', metadata.get('file.name'), id);
                resolve(metadata);
            }).catch((e) => {
                console.error('-- not updated', metadata.search, e);

                process.exit(-1);

                reject();
            });
        });
    }

    /**
     * 
     * @param   Metadata metadata 
     * @returns {Promise}
     */
    exists(metadata) {
        return new Promise((resolve, reject) => {
            this._client.search({
                index: this._index,
                type: 'media',
                body: {
                    query: {
                        term: {
                            checksum: metadata.get('checksum')
                        }
                    },
                    size: 1
                }
            }).then((result) => {
                if (result.hits.total > 0) {
                    resolve(result.hits.hits[0]._id);
                } else {
                    reject();
                }

            }).catch((e) => {
                reject();
            });
        });
    }
}

module.exports = Indexer;
