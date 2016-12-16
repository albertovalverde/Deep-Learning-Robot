module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    // Javascript
    uglify: {
      bowerlibs: {
        files: [
          { src: 'src/js/vendor/modernizr.js', dest:'src/js/vendor/modernizr.js' },
          { src: 'src/js/vendor/require.js', dest:'src/js/vendor/require.js' },
          { src: 'src/js/vendor/easeljs-0.8.2.min.js', dest:'src/js/vendor/easeljs-0.8.2.min.js' },
          { src: 'src/js/vendor/tweenjs-0.6.2.min.js', dest:'src/js/vendor/tweenjs-0.6.2.min.js' },
          { src: 'src/js/vendor/annyang.min.js', dest:'src/js/vendor/annyang.min.js' },
         // { src: 'src/js/vendor/tracking-min.js', dest:'src/js/vendor/tracking-min.js' },
          { src: 'src/js/vendor/headtrackr.min.js', dest:'src/js/vendor/headtrackr.min.js' },
         // { src: 'src/js/vendor/face-min.js', dest:'src/js/vendor/face-min.js' },
          { src: 'src/js/vendor/stats.min.js', dest:'src/js/vendor/stats.min.js' },
          { src: 'src/js/vendor/speakGenerator.js', dest:'src/js/vendor/speakGenerator.js' },
          { src: 'src/js/vendor/speakWorker.js', dest:'src/js/vendor/speakWorker.js' },
          { src: 'src/js/vendor/speakClient.js', dest:'src/js/vendor/speakClient.js' },
          { src: 'src/js/vendor/twilio.js', dest:'src/js/vendor/twilio.js' }
           
        ]
      }
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: "dist/js/",
          mainConfigFile: "dist/js/app.js",
          out: "dist/js/app.js",
          name: "app",
          paths: {
              jquery: "empty:"
          }
        }
      }
    },

    // CSS
    autoprefixer: {
      single_file: {
        src: 'src/css/main.css',
        dest: 'src/css/styles.css'
      }
    },
    cssmin: {
      compress: {
        files: {
          "dist/css/styles.css": ['dist/css/normalize.css', 'dist/css/styles.css']
        }
      }
    },

    // Images
    imagemin: {                       
      dynamic: {                        
        files: [{
          expand: true,                 
          cwd: 'dist/img/',             
          src: '**/*.{png,gif}',  
          dest: 'dist/img/'             
        }]
      }
    },

    copy: {
      bowerlibs: {
        files: [
          { expand:true, cwd:'bower_components/jquery/',    src:'jquery.min.js', dest: 'src/js/vendor/' },
          { expand:true, cwd:'bower_components/modernizr/', src:'modernizr.js', dest: 'src/js/vendor/' },
          { expand:true, cwd:'bower_components/requirejs/', src:'require.js', dest: 'src/js/vendor/' },
          { expand:true, cwd:'bower_components/EaselJS/lib/', src:'easeljs-0.8.2.min.js', dest: 'src/js/vendor/' },
          { expand:true, cwd:'bower_components/TweenJS/lib/', src:'tweenjs-0.6.2.min.js', dest: 'src/js/vendor/' },
          { expand:true, cwd:'bower_components/PreloadJS/lib/', src:'preloadjs-0.6.2.min.js', dest: 'src/js/vendor/' },
          { expand:true, cwd:'bower_components/annyang/', src:'annyang.min.js', dest: 'src/js/vendor/' },
         // { expand:true, cwd:'bower_components/tracking/build/', src:'tracking-min.js', dest: 'src/js/vendor/' },
         // { expand:true, cwd:'bower_components/tracking/build/data/', src:'face-min.js', dest: 'src/js/vendor/' },
          { expand:true, cwd:'bower_components/headtrackr/', src:'headtrackr.min.js', dest: 'src/js/vendor/' },
          { expand:true, cwd:'bower_components/stats.js/build/', src:'stats.min.js', dest: 'src/js/vendor/' },
          { expand:true, cwd:'bower_components/speak.js/', src:'speakWorker.js', dest: 'src/js/vendor/' },
          { expand:true, cwd:'bower_components/speak.js/', src:'speakGenerator.js', dest: 'src/js/vendor/' },
          { expand:true, cwd:'bower_components/speak.js/', src:'speakClient.js', dest: 'src/js/vendor/' },
           { expand:true, cwd:'bower_components/twilio/', src:'twilio.js', dest: 'src/js/vendor/' }
          
        ],
      },
      build: {
        files: [{ 
          expand: true,
          cwd: 'src/',
          src: '**/*',
          dest: 'dist/'
        }]
      }
    },

    clean: [ 
      'dist/css/main.css',
      'dist/css/normalize.css'
    ],

    express: {
      dev: {
        options: {
          script: './server.js'
        }
      }
    },
    
    watch: {
      autoprefix: {
        files: ['src/css/main.css'],
        tasks: ['autoprefixer']
      },
      css: {
        files: ['src/css/styles.css'],
        options: { livereload: true}
      },
      js: {
        files: ['src/js/**/*.js'],
        options: { livereload: true}
      },
      html: {
        files: ['src/**/*.html'],
        options: { livereload: true}
      }
    },

    open : {
      dev : {
        path: 'http://localhost:3000'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-open');

  grunt.registerTask('start', ['copy:bowerlibs', 'uglify:bowerlibs']);
  grunt.registerTask('dev', ['express:dev', 'autoprefixer', 'open', 'watch']);
  grunt.registerTask('build', ['autoprefixer', 'copy:build', 'requirejs', 'cssmin', 'clean']);
  //grunt.registerTask('build', ['autoprefixer', 'copy:build', 'requirejs', 'cssmin', 'clean', 'imagemin']);

};