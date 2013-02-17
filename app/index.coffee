{Application} = require 'helpers'
{Router} = require 'router'
{Blog} = require 'models'
{DropboxView, SignupView,  SettingsView, PublishView, UsernameView} = require 'views'

class exports.Calepin extends Application
    
  onReady: (app) ->
    
    app.models.blog = new Blog server.blog
    
    authorized = app.models.blog.get "username"
    active = app.models.blog.get "valid"
    
    if authorized
      app.views.dropbox = new DropboxView model: app.models.blog
      app.views.username = new UsernameView model: app.models.blog
    else
      app.views.dropbox = new SignupView
    
    app.views.settings = new SettingsView model: app.models.blog
    app.views.settings.disable() unless server.blog.id
    
    app.views.publish = new PublishView model: app.models.blog
      
    @router = new Router
    Backbone.history.start pushState: true
    @router.navigate server.route if server.route

window.app = new exports.Calepin