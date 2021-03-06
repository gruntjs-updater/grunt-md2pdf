'use strict';

var pdf = require('html-to-pdf');
var path = require('path');
var md2html = require('./lib/md2html');

module.exports = function (grunt) {

    grunt.registerMultiTask('md2pdf', 'Converts markdown to pdf', function () {

        var options = this.options({
            toc: false,
            tocDepth: null,
            tocTitle: 'Table of contents',
            stylesheet: __dirname + '/lib/style.css',
            titlePage: null
        });
        
        var done = this.async();
        var total = this.files.length;
        var resolved = 0;

        // Iterate over all specified file groups.
        this.files.forEach(function (filePath) {

            var opts = Object.create(options);

            // three lines is not enough to start using lodash or underscore...
            for(var key in filePath.options) {
                opts[key] = filePath.options[key];
            }

            grunt.log.writeln('Converting markdown to html...');
            var html = md2html(filePath.src,opts);


            grunt.file.mkdir(path.dirname(filePath.dest));

            grunt.log.writeln('Converting html to pdf...');
            pdf.convertHTMLString( html, filePath.dest, function( error ){
                if ( error ) {
                    grunt.log.warn(error);
                } else {
                    grunt.log.ok('Generated ' + path.resolve(filePath.dest) );
                }

                // promisses smomisses.
                resolved++;
                if ( resolved === total ) {
                    done();
                }
            });
            
        });
    });

};