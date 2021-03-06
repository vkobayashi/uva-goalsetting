'use strict';

module.exports = function(grunt) {
  // Unified Watch Object
  var watchFiles = {
    serverViews: ['app/views/**/*.*'],
    serverJS: ['gruntfile.js', 'server.js', 'config/**/*.js', 'app/**/*.js'],
    clientViews: ['public/modules/**/views/**/*.html'],
    clientJS: ['public/js/*.js', 'public/modules/**/*.js'],
    clientCSS: ['public/modules/**/*.css'],
    mochaTests: ['app/tests/**/*.js'],
    sass: ['public/scss/**/*.scss']
  };

  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      serverViews: {
        files: watchFiles.serverViews,
        options: {
          livereload: true
        }
      },
      serverJS: {
        files: watchFiles.serverJS,
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      clientViews: {
        files: watchFiles.clientViews,
        options: {
          livereload: true,
        }
      },
      clientJS: {
        files: watchFiles.clientJS,
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      clientCSS: {
        files: watchFiles.clientCSS,
        tasks: ['csslint'],
        options: {
          livereload: true
        }
      },
      sass: {
        files: watchFiles.sass,
        tasks: ['sass'],
        options: {
          livereload: true
        }
      }
    },
    jshint: {
      all: {
        src: watchFiles.clientJS.concat(watchFiles.serverJS),
        options: {
          jshintrc: true
        }
      }
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc',
      },
      all: {
        src: watchFiles.clientCSS
      }
    },
    uglify: {
      production: {
        options: {
          mangle: false
        },
        files: {
          'public/dist/application.min.js': 'public/dist/application.js'
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'public/dist/application.min.css': '<%= applicationCSSFiles %>'
        }
      }
    },
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          nodeArgs: ['--debug'],
          ext: 'js,html',
          watch: watchFiles.serverViews.concat(watchFiles.serverJS)
        }
      }
    },
    'node-inspector': {
      custom: {
        options: {
          'web-port': 1337,
          'web-host': 'localhost',
          'debug-port': 5858,
          'save-live-edit': true,
          'no-preload': true,
          'stack-trace-limit': 50,
          'hidden': []
        }
      }
    },
    ngAnnotate: {
      production: {
        files: {
          'public/dist/application.js': '<%= applicationJavaScriptFiles %>'
        }
      }
    },
    concurrent: {
      default: ['nodemon', 'watch'],
      debug: ['nodemon', 'watch', 'node-inspector'],
      options: {
        logConcurrentOutput: true,
        limit: 10
      }
    },
    env: {
      test: {
        NODE_ENV: 'test'
      },
      secure: {
        NODE_ENV: 'secure'
      },
      appSettings: {
        APP_URL: 'http://localhost:3000',
        REMINDER_TIME: '96', // in hours
        TINCAN_CREATED: 'http://adlnet.gov/expapi/verbs/created',
        TINCAN_COMMITTED: 'http://activitystrea.ms/schema/1.0/accept',
        TINCAN_COMPLETED: 'http://activitystrea.ms/schema/1.0/complete',
        TINCAN_ABORTED: 'http://activitystrea.ms/schema/1.0/cancel',
        TINCAN_UPDATED: 'http://activitystrea.ms/schema/1.0/update',
        TINCAN_LOGIN: 'https://brindlewaye.com/xAPITerms/verbs/loggedin/',
        TINCAN_VIEW: 'http://id.tincanapi.com/verb/viewed',
        TINCAN_APPROVED: 'http://activitystrea.ms/schema/1.0/approve',
        TINCAN_RATING: 'http://id.tincanapi.com/verb/rated',
        TINCAN_TAG_ADDED: 'http://activitystrea.ms/schema/1.0/tag',
        MAIL_FROM: 'uva@ihatestatistics.com'
      },
      secretVars: {
        LRS_ENDPOINT: 'https://cloud.scorm.com/tc/XL7FI9R9KB/',
        LRS_USERNAME: '8P6dVx5tr-EdPBxMNDk',
        LRS_PASSWORD: 'KDbm4DqW1Z9eZtgKhfA',
        MAIL_HOST: 'smtp.mandrillapp.com',
        MAIL_PORT: 587,
        MAIL_USERNAME: 'robin@ihatestatistics.com',
        MAIL_PASSWORD: 'vMs4KpRlVDPqxSHkBriJog'
      }
    },
    mochaTest: {
      src: watchFiles.mochaTests,
      options: {
        reporter: 'spec',
        require: 'server.js'
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },
    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'public/css/foundation.css': watchFiles.sass
        }
      }
    }
  });

  // Load NPM tasks
  require('load-grunt-tasks')(grunt);

  // Making grunt default to force in order not to break the project.
  grunt.option('force', true);

  // A Task for loading the configuration object
  grunt.task.registerTask('loadConfig', 'Task that loads the config into a grunt option.', function() {
    var init = require('./config/init')();
    var config = require('./config/config');

    grunt.config.set('applicationJavaScriptFiles', config.assets.js);
    grunt.config.set('applicationCSSFiles', config.assets.css);
  });

  // Default task(s).
  grunt.registerTask('default', ['env:secretVars', 'env:appSettings', 'sass', 'lint', 'concurrent:default']);

  // Debug task.
  grunt.registerTask('debug', ['lint', 'concurrent:debug']);

  // Secure task(s).
  grunt.registerTask('secure', ['env:secure', 'lint', 'concurrent:default']);

  // Lint task(s).
  grunt.registerTask('lint', ['jshint', 'csslint']);

  // Build task(s).
  grunt.registerTask('build', ['sass', 'lint', 'loadConfig', 'ngAnnotate', 'uglify', 'cssmin']);

  // Test task.
  grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit']);
};