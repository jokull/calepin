signup_tpl = require('templates/signup')
dropbox_tpl = require('templates/dropbox')
settings_tpl = require('templates/settings')
publish_tpl = require('templates/publish')
publish_success_tpl = require('templates/publish_success')


class exports.ToggleView extends Backbone.View
    
  disable: =>
    (@$ ":input").attr "disabled", "disabled"
    ($ @el).addClass "disabled"
  
  enable: =>
    (@$ ":input").removeAttr "disabled"
    ($ @el).removeClass "disabled"
    

class UsernameInputView extends Backbone.View
  
  TIMEOUT_MS: 800
  MIN_LENGTH: 2
  
  events:
    "focus": "reset"
    "blur": "sanitize"
    "keydown": "keydown"
  
  initialize: (options) ->
    @$field = ($ @el).parent()
    @$availability = @$field.find ".availability"
    @el.value = @model.get "username" if @model
  
  clean: (s) ->
    s = s.replace /[^-_a-zA-Z0-9,&\s]+/ig, ''
    s.replace /\s/gi, '-'
  
  sanitize: (e) =>
    @el.value = @clean @el.value
    @$availability.html ""
  
  reset: =>
    @valid = false
    @$availability.html ""
    @$field.removeClass "available"
  
  validate: (options={}) =>
    @reset()
    return unless @el.value
    clean = @clean @el.value
    if @el.value != clean
      return @$availability.html "#{@el.value} won't fit in a URL. How about #{clean}?"
    
    $.post server.urls['api.availability'], username: @el.value, (data) =>
      if data.available
        message = "#{@el.value}</em>.calepin.co is available!"
        @$field.addClass "available"
      else
        message = "<em>#{@el.value}</em>.calepin.co is taken"
      @$availability.html message
      options.success(data) if options.success
    
  keydown: (e) =>
    clearTimeout @validateTimeout
    if @el.value.length > @MIN_LENGTH
      @validateTimeout = setTimeout @validate, @TIMEOUT_MS



class exports.SignupView extends Backbone.View
  
  el: "#dropbox"
  
  initialize: (options) ->
    @render()
  
  events:
    "click .signup input[type=submit]": "signup"
    "click .login input[type=submit]": "login"
    
  render: =>
    ($ @el).html signup_tpl()
    @username_view = new UsernameInputView
      el: ($ "input[name=username]" ,@el).get(0)
    @
    
  signup: (e) =>
    e.preventDefault()
    url = server.urls['frontend.signup']
    success = (data) =>
      data = username: @username_view.el.value
      $.post url, data, (data) =>
        window.location = data.redirect
    if @username_view.valid
      success availalable: true
    else:
      @username_view.validate success: success
  
  login: (e) =>
    e.preventDefault()
    $.post server.urls['frontend.login'], {}, (data, status) =>
      window.location = data.redirect



class exports.UsernameView extends Backbone.View
  
  el: ".username-edit"
  
  initialize: (options) ->
    @model.bind "error", @error
    @$username = @$ "input[name=username]"
    @render()
  
  events:
    "click input[type=submit]": "submit"
    
  render: =>
    @username_view = new UsernameInputView
      el: @$username.get(0)
      model: @model
    this
  
  error: (model, message) =>
    $status = (@$ ".status").addClass("show")
    $status.html message
    
  submit: (e) =>
    e.preventDefault()
    clearTimeout @completedTimeout if @completedTimeout
    $status = (@$ ".status").addClass("show")
    if @$username.val()
      $status.html("Saving ...")
    else
      $status.html("Invalid username")
    @model.save {
      username: @$username.val()
    }, {
      error: (model, response) =>
        $status.html(response)
      success: (data) =>
        $status.html("Saved")
        @completedTimeout = setTimeout(-> 
          status.removeClass "show"
        , 1500)
    }


class exports.DropboxView extends Backbone.View
  
  el: "#dropbox"
  
  events:
    "click a.logout": "logout"
    "click .delete a": "delete"
  
  initialize: (options) ->
    @render()
    
  render: =>
    ($ @el).html dropbox_tpl @model.toJSON()
    @
  
  logout: (e) =>
    e.preventDefault()
    $.post server.urls['api.logout'], {}, (data) =>
      window.location = server.urls['frontend.site']
  
  delete: (e) =>
    e.preventDefault()
    return unless confirm "Delete your Calepin account? You can sign up for a Calepin again anytime."
    app.models.blog.destroy
      success: (data) =>
        window.location = ""
    

class exports.SettingsView extends exports.ToggleView
  
  el: "#settings"
  
  events:
    "submit form": "submit"
  
  initialize: (options) ->
    @render()
  
  render: =>
    ($ @el).html settings_tpl @model.toJSON()
    unless @model.get "sitename"
      @model.get_dropbox (data) =>
        (@$ "[name=sitename]").val data.display_name
    @

  submit: (e) =>
    e.preventDefault()
    clearTimeout @completedTimeout if @completedTimeout
    $status = ($ ".status", @el)
    $status.addClass("show").html "Saving ..."
    @model.save {
      cname: (@$ "[name=cname]").val()
      sitename: (@$ "[name=sitename]").val()
      disqus: (@$ "[name=disqus]").val()
      twitter: (@$ "[name=twitter]").val()
    }, {
      success: (data) =>
        $status.html "Saved"
        @completedTimeout = setTimeout(-> 
          $status.removeClass "show"
        , 1500)
    }


class exports.PublishView extends exports.ToggleView
  
  el: "#publish"
  
  events:
    "click button.publish": "publish"
  
  initialize: (options) ->
    @model.bind "change", @render
    @render()
    
  render: =>
    ($ @el).html publish_tpl @model.toJSON()
    if @model.get "valid" then @enable() else @disable()
    @

  track: =>
    args = ['_trackEvent', 'Interface', 'Published', (@model.get "username")]
    if window._gaq
      window._gaq.push args
  
  publish: (e) =>
    e.preventDefault()
    (@$ ".status").html("Syncing & Publishing")
    @disable()
    @model.publish 
      success: (data) =>
        (@$ ".status").html publish_success_tpl data
      error: (data) =>
        (@$ ".status").html "Server error encountered"
      complete: (xhr, status) =>
        @enable()
        @track()
        (@$ ".visit").css opacity: "1"
		
		
		














