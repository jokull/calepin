class exports.Application
  
  constructor: ->
        
    @routers = {}
    @models = {}
    @collections = {}
    @views = {}
    @utils = {}
    
    (jQuery document).ready =>
      @onReady @
      for own key, module of @modules
        module.onReady @, key

  onReady: (app) -> null


class exports.Module extends exports.Application
  
  constructor: ->
    @routers = {}
    @models = {}
    @collections = {}
    @views = {}
    @utils = {}
  
  onReady: (app, label) -> null