class DeviantArtParser {
    /**
     * @param {Metadata} metadata 
     * @returns {Promise}
     */
    parse(metadata) {
        return new Promise((resolve, reject) => {

            if(metadata.has('keywords')) {
                if(metadata.get('keywords').indexOf('DeviantArt') > -1) {
                    // parse filename

                    let filename = metadata.get('file.name');
                    if(filename.indexOf('_by_') > -1) {
                        let [title, author] = filename.split('_by_');
                        author = author.split('-').shift();

                        metadata.set('author', author);
                        metadata.set('title', title);
                        metadata.add('keywords', [author]);
                    }

                }
            }

            resolve();
        });
    }
}

module.exports = DeviantArtParser;