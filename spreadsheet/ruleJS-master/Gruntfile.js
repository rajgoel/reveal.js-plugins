/**
 * Installation:
 * 1. Install Grunt CLI (`npm install -g grunt-cli`)
 * 1. Install Grunt 0.4.0 and other dependencies (`npm install`)
 *
 * Build:
 * Execute `grunt` from root directory of this directory (where Gruntfile.js is)
 * To execute automatically after each change, execute `grunt --force default watch`
 * To execute build followed by the test run, execute `grunt test`
 *
 * See http://gruntjs.com/getting-started for more information about Grunt
 */
module.exports = function (grunt) {
  grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      // GENERATED PARSER USING JISON LIBRARY
      jison: {
        target : {
          options: {moduleType: 'js', moduleName: 'Parser'},
          files: {'src/parser/parser.js': 'src/parser/parser.jison'}
        }
      },

      // COPY FILES FROM DESIGN DIRECTORY TO DIST DIRECTORY
      copy: {
        main: {
          files: [
            {
              src: 'lib/underscore.string/lib/underscore.string.js',
              dest: 'dist/lib/underscore.string/underscore.string.js'
            },
            {
              src: 'lib/moment/moment.js',
              dest: 'dist/lib/moment/moment.js'
            },
            {
              src: 'lib/lodash/dist/lodash.js',
              dest: 'dist/lib/lodash/lodash.js'
            },
            {
              src: 'lib/numeral/numeral.js',
              dest: 'dist/lib/numeral/numeral.js'
            },
            {
              src: 'lib/js-md5/js/md5.js',
              dest: 'dist/lib/js-md5/md5.js'
            },
            {
              src: 'lib/jstat/dist/jstat.js',
              dest: 'dist/lib/jstat/jstat.js'
            },
            {
              src: 'lib/formulajs/lib/formula.js',
              dest: 'dist/lib/formulajs/formula.js'
            },
            {
              src: 'src/js/ruleJS.js',
              dest: 'dist/js/ruleJS.js'
            },
            {
              src: 'src/parser/parser.js',
              dest: 'dist/js/parser.js'
            }
//            ,{
//              expand: true,
//              cwd: 'src/js/',
//              src: ['**'],
//              dest: 'dist/js/'
//            }
          ]
        }
      },

      concat: {
        dist: {
          files : {
            'dist/full/ruleJS.lib.full.js': [
              'dist/lib/lodash/lodash.js',
              'dist/lib/underscore.string/underscore.string.js',
              'dist/lib/moment/moment.js',
              'dist/lib/numeral/numeral.js',
              'dist/lib/js-md5/md5.js',
              'dist/lib/jstat/jstat.js',
              'dist/lib/formulajs/formula.js'
            ],
            'dist/full/ruleJS.parser.full.js': [
              'dist/js/parser.js',
              'dist/js/ruleJS.js'
            ],
            'dist/full/ruleJS.all.full.js': [
              'dist/full/ruleJS.lib.full.js',
              'dist/full/ruleJS.parser.full.js'
            ]
          }
        }
      },

      uglify: {
        my_target: {
          options: {
            preserveComments: false
            //mangle: false
          },
          files: {
            'dist/full/ruleJS.all.full.min.js': ['dist/full/ruleJS.all.full.js']
          }
        }
      },


      // WATCH CHANGES
      watch: {
        options: {
          livereload: true //works with Chrome LiveReload extension. See: https://github.com/gruntjs/grunt-contrib-watch
        },
        files: [
          'src/*.html',
          'src/js/*.js',
          'src/parser/*.jison'
        ],
        tasks: ['build']
      },
      clean: {
        dist: ['tmp']
      },
      replace: {
        dist: {
          options: {
            variables: {
              version: '<%= pkg.version %>',
              timestamp: '<%= (new Date()).toString() %>'
            }
          }
        }
      },
      jasmine: {
        ruleJS: {
          src: [
            'dist/js/ruleJS.js',
            'dist/js/parser.js'
          ],
          options: {
            specs: [
              'test/jasmine/spec/*Spec.js',
              'test/jasmine/spec/*/*Spec.js'
            ],
            styles: [
              'test/jasmine/css/SpecRunner.css'
            ],
            helpers: [
              'test/jasmine/spec/SpecHelper.js',
              'test/jasmine/lib/nodeShim.js'
            ],
            outfile: 'test/jasmine/SpecRunner.html',
            template: 'test/jasmine/templates/SpecRunner.tmpl',
            keepRunner: true
          }
        }
      },
      connect: {
        dev: {
          options: {
            port: 8080,
            hostname: "0.0.0.0",
            base: "",
            keepalive: true
          }
        }
      }
    }
  );

  // DEFAULT TASKS
  grunt.registerTask('default', ['jison', 'copy', 'replace:dist', 'clean', 'concat', 'uglify']);

  grunt.registerTask('test', ['default', 'jasmine']);
  grunt.registerTask('start', ['default', 'connect']);

  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-config');
  grunt.loadNpmTasks('grunt-inject');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jison');
};
