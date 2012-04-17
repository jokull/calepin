class exports.Blog extends Backbone.Model

  url: =>
    server.urls['api.blog_edit'].replace "<id>", @id
  
  get_dropbox: (callback) =>
    $.getJSON server.urls['api.dropbox_profile'], callback
  
  set_dropbox: =>
    @get_dropbox (data) =>
      @set dropbox: data
  
  publish: (options={}) =>
    params = 
      success: ->
      error: ->
      complete: ->
      type: "POST"
      url: server.urls['api.publish'].replace "<id>", @id
    params = _.extend(params, options)
    $.ajax params
  
  validate: (attrs) ->
    for field, value of attrs
      if field in ['username', 'site']
        return "#{field} is required" unless value
    return undefined
    