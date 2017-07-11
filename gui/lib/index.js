require('../../shared/extend/promises');

const elastic = require('elasticsearch');
const config = require('../../config.json');
const $ = require('jquery');
const _ = require('lodash');
require('jquery-match-height');

const Metadata = require('./metadata');

config.search.host = "http://localhost:9200"; // needs protocol

const client = new elastic.Client(config.search);

function search(terms) {
    client.search({
        index: config.index,
        type: 'media',
        body: {
            query: {
                bool: {
                    must: {
                        query_string: {
                            query: "*:*"
                        }
                    }
                }
            }
        }
    }).then((results) => {
        $('.media-list').empty();

        for(const hit of results.hits.hits) {
            let m = new Metadata(hit);
            let f = m.format();

            $('.media-list').append(f);
        }
    }).catch((error) => {
        console.error('-- error', error);
    }).finally(() => {
        $('.materialboxed').materialbox();

        setTimeout(() => {
            $('.media-list .card').matchHeight({
                byRow: true,
                property: 'height'
            });
        }, 1);
    });
}

$(document).ready(() => {
    $('.search-input').on('keyup', _.debounce(() => {
        let terms = $('.search-input').val();

        search(terms);
    }, 250));

    Materialize.scrollFire([
        { selector: '.end', offset: 0, callback: () => { console.info('-- fired'); }}
    ])
});
