
/*global module:false*/
module.exports = function(grunt) {

  var meta = {
    banner: '/*\n  <%= pkg.title || pkg.name %> <%= pkg.version %>' +
      '<%= pkg.homepage ? " <" + pkg.homepage + ">" : "" %>' + '\n' +
      '  Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>' +
      '\n\n  Released under <%= _.pluck(pkg.licenses, "type").join(", ") %> License\n*/',
    pre: '\n(function(window, document){\n\n',
    post: '\n})(window,document);'
  };

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    clean: ["build"],
    
    shell: {
        buildHtml2canvas: {
            command: 'grunt --gruntfile ./html2canvas/Gruntfile.js'
        },
        deploy: {
            command: "node s3publish"
        }
    },
    
    copy: {
      resources: {
        files: [
          {expand: true, flatten: true, src: ['anigif/img/*'], dest: 'build/<%= pkg.name %>/img', filter: 'isFile'}, // includes files in path
          {expand: true, flatten: true, src: ['sampleResources/*'], dest: 'build/sampleResources', filter: 'isFile'}, // includes files in path
        ]
      },
      javascript: {
        files: [
          {expand: true, flatten: true, src: ['anigif/jsgif/GIFEncoder.js', 'anigif/jsgif/LZWEncoder.js', 'anigif/jsgif/NeuQuant.js', 'anigif/jsgif/workcrew.js', 'anigif/jsgif/worker.js'], dest: 'build/<%= pkg.name %>/jsgif', filter: 'isFile'},
          {expand: true, flatten: true, src: ['anigif/jsgif/Demos/b64.js'], dest: 'build/<%= pkg.name %>/jsgif/Demos', filter: 'isFile'}
        ]
      },
      html: {
         files: [
          {expand: true, flatten: true, src: ['anigif/bar.html'], dest: 'build/<%= pkg.name %>', filter: 'isFile'}, // includes files in path
        ] 
      }
    },

    
    concat: {
      anigif: {
        src: [
          'anigif/jsgif/GIFEncoder_WebWorker.js',
          'anigif/jsgif/workcrew.js',
          'anigif/*.js',
          'html2canvas/build/html2canvas.js',
          'node_modules/async/lib/async.js',
          'bower_components/fabric/dist/all.js'
        ],
        dest: 'build/<%= pkg.name %>/<%= pkg.name %>.js'
      },
     
      options:{
        //banner: meta.banner + meta.pre,
        //footer: meta.post,
        process: function(src, filepath) {
            return '/* ' + filepath + ' */\n' + src;
        }
      }
    },
    
    targethtml: {
      prod: {
        files: {
          'build/simple.html': 'simpleTemplate.html'
        }
      },
       dev: {
        files: {
          './simple.html': 'simpleTemplate.html'
        }
      }
    },

    uglify: {
      anigif: {
        src: ['<%= concat.anigif.dest %>'],
        dest: 'build/<%= pkg.name %>/<%= pkg.name %>.min.js'
      },
      options: {
        banner: meta.banner
      }
    },
    jshint: {
      all: ['anigif/*.js', 'html2canvas/build/html2canvas.js'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        devel: true,
        globals: {
          jQuery: true
        }
      }
    },
    
    watch: {
      files: ['src/*', 'test/*'],
      tasks: ['default']
    },
    simplemocha: {
        options: {
          globals: ['should'],
          timeout: 120000,
          ignoreLeaks: false,
          ui: 'bdd',
          reporter: 'tap'
        },
    
        all: { src: ['test/**/*.js'] }
    }
  });


  grunt.registerTask('s3deploy', 'deploy /build to s3', function(arg1, arg2) {
   

    
  });


  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-targethtml');

  grunt.registerTask('default', ['targethtml:dev']);
  grunt.registerTask('full', ['clean', 'shell:buildHtml2canvas', 'jshint',  'targethtml:prod', 'targethtml:dev', 'concat', 'copy', 'uglify']);
  grunt.registerTask('build-prod', ['clean', 'targethtml:prod', 'targethtml:dev', 'concat', 'copy', 'uglify']);
  grunt.registerTask('test', ['simplemocha']);
};
