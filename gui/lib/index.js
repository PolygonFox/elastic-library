require('../../shared/extend/promises');

const elastic = require('elasticsearch');
const config = require('../../config.json');
const $ = require('jquery');
const _ = require('lodash');
require('jquery-match-height');
require('jquery-on-infinite-scroll');

const MetadataFormat = require('./metadata');
const SlideshowFormat = require('./slideshow');

config.search.host = "http://localhost:9200"; // needs protocol

const client = new elastic.Client(config.search);

const pagination = {
    from: 0,
    size: 50,
    total: 0
}

let currentResults = [];

function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
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
            currentResults.length = 0; // reset slideshow
        }

        console.info('-- searched for', terms, 'found', results.hits.hits.length);

        pagination.total = results.hits.total;
        currentResults = _.concat(currentResults, results.hits.hits);

        for(const hit of results.hits.hits) {
            let m = new MetadataFormat(hit);

            $('.media-list').append(m.format());
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

function slideshow() {
    const slider = $('<div class="slider fullscreen"><ul class="slides"></ul></div>');
    shuffle(currentResults);

    for(const result of currentResults) {
        let s = new SlideshowFormat(result);

        slider.find('.slides')
        .append(s.format());
    }

    $('body').append(slider).find('.slider').slider({
        indicators: false,
        interval: 3000,
        transition: 250
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

module.exports = {
    toggleSlideshow: () => {
        if($('body').hasClass('slideshow')) {
            $('body').removeClass('slideshow');
            $('.slider').remove();
        } else {
            $('body').addClass('slideshow');
            slideshow();
        }
    }
}