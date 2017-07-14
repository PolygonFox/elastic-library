class NumberParser {
    /**
     * [[Description]]
     * @param   {Metadata} metadata [[Description]]
     * @returns {Promise} [[Description]]
     */
    parse(metadata) {
        return new Promise((resolve) => {

            let matches = metadata.file.match(/[0-9]{4,}/g);

            if (matches) {
                matches = matches.map((x) => {
                    return new String(x);
                });
            } else {
                matches = [];
            }

            metadata.set('numbers', matches);

            resolve();
        });
    }
}

module.exports = NumberParser;
