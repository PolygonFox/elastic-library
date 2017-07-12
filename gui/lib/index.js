require('../../shared/extend/promises');

const elastic = require('elasticsearch');
const config = require('../../config.json');
const $ = require('jquery');
const _ = require('lodash');
require('jquery-match-height');
require('jquery-on-infinite-scroll');

const MetadataFormat = require('./metadata');

config.search.host = "http://localhost:9200"; // needs protocol

const client = new elastic.Client(config.search);

const pagination = {
    from: 0,
    size: 50,
    total: 0
}

function search(terms) {
    client.search({
        index: config.index,
        type: 'media',
        body: {
            query: {
                bool: {
                    must: {
                        query_string: {
                            query: terms
                        }
                    }
                }
            },
            size: pagination.size,
            from: pagination.from
        }
    }).then((results) => {
        if(pagination.from === 0) {
            $('.media-list').empty();
        }

        console.info('-- searched for', terms, 'found', results.hits.hits.length);

        pagination.total = results.hits.total;

        for(const hit of results.hits.hits) {
            let m = new MetadataFormat(hit);
            let f = m.format();

            $('.media-list').append(f);
        }
    }).catch((error) => {
        console.error('-- error', error);
    }).finally(() => {
        $('.materialboxed').materialbox();
        //$('.chips').material_chip();

        _.defer(() => {
            $('.media-list .card').matchHeight({
                byRow: true,
                property: 'height'
            });
        });
    });
}

$(document).ready(() => {
    $('.search-input').on('keypress', (e) => {
        if(e.which === 13) {
            $('.search-input').blur();

            pagination.from = 0;

            search($('.search-input').val());
        }
    });

    $('form').on('submit', () => { return false; });

    search($('.search-input').val());

    $.onInfiniteScroll(() => {
        pagination.from += pagination.size;
        if(pagination.from < pagination.total) {
            search($('.search-input').val());
        }
    }, 100);

    $('nav').pushpin();
});
