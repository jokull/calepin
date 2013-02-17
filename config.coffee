exports.config =
  # See docs at http://brunch.readthedocs.org/en/latest/config.html.

  paths:
    public: "calepin/static"

  files:
    javascripts:
      joinTo:
        'script.js': /^app/
        'vendor.js': /^vendor/
      order:
        before: [
          'vendor/scripts/console-helper.js'
          'vendor/scripts/jquery-1.9.0.js'
          'vendor/scripts/lodash-1.0.0-rc3.js'
          'vendor/scripts/modernizr-2.6.2.js'
          'vendor/scripts/backbone-0.9.9.js'
        ]

    stylesheets:
      joinTo: 'styles.css'

    templates:
      defaultExtension: 'eco'
      joinTo: 'script.js'
