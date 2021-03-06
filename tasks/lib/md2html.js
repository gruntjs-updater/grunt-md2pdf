'use strict';

var grunt = require('grunt');
var createToc = require('marked-toc');
var marked = require('marked');
var path = require('path');

module.exports = function( src, options ){

    var content = [], markdown = [];
    var toc = '', css = '', html = '', titlePage = '';

    var renderer = new marked.Renderer();
    var markedOptions = {
        renderer: renderer
    };

    var template = '<html><head><style>{{css}}</style></head><body>{{titlePage}}{{toc}}{{content}}</body></html>';
    var templateToc = '<h1 class="toc">{{toc-title}}</h1><div class="toc">{{toc}}</div>';
    var templateTitlePage = '<div class="title-page">{{content}}</div>';

    [].concat( src ).forEach(function( filepath ){

        if (!grunt.file.exists(filepath)) {
            throw new Error('Source file "' + filepath + '" not found.');
        }

        renderer.image = function( href, title, text){
            href = path.join(path.dirname(filepath),href);
            return '<img src="'+href+'" alt="'+text+'" title="'+title+'" />';
        };

        var md = grunt.file.read(filepath);
        markdown.push(md);

        content.push(marked(md,markedOptions));

    });

    markdown = markdown.join('\n');
    content = content.join('');

    if ( options
        && options.stylesheet ) {
        css = grunt.file.read( options.stylesheet  )
    }

    if ( options
        && options.toc ) {

        toc = createToc(markdown, {
            maxDepth: options.tocDepth || null,
            firsth1: true
        });

        toc = templateToc
            .replace('{{toc-title}}', options.tocTitle || 'Table of contents')
            .replace('{{toc}}',marked(toc));

    }

    if ( options
        && options.titlePage
        && grunt.file.exists(options.titlePage) ) {

        renderer.image = function( href, title, text){
            href = path.join(path.dirname(options.titlePage),href);
            return '<img src="'+href+'" alt="'+text+'" title="'+title+'" />';
        };

        titlePage = marked(grunt.file.read(options.titlePage), markedOptions);
        titlePage = templateTitlePage.replace('{{content}}', titlePage);
    }


    html = template
        .replace('{{css}}',css)
        .replace('{{titlePage}}',titlePage)
        .replace('{{toc}}', toc)
        .replace('{{content}}', content);

    return html;

};
