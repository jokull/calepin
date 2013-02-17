(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

window.require.define({"helpers": function(exports, require, module) {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  exports.Application = (function() {

    function Application() {
      var _this = this;
      this.routers = {};
      this.models = {};
      this.collections = {};
      this.views = {};
      this.utils = {};
      (jQuery(document)).ready(function() {
        var key, module, _ref, _results;
        _this.onReady(_this);
        _ref = _this.modules;
        _results = [];
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          module = _ref[key];
          _results.push(module.onReady(_this, key));
        }
        return _results;
      });
    }

    Application.prototype.onReady = function(app) {
      return null;
    };

    return Application;

  })();

  exports.Module = (function(_super) {

    __extends(Module, _super);

    function Module() {
      this.routers = {};
      this.models = {};
      this.collections = {};
      this.views = {};
      this.utils = {};
    }

    Module.prototype.onReady = function(app, label) {
      return null;
    };

    return Module;

  })(exports.Application);
  
}});

window.require.define({"index": function(exports, require, module) {
  var Application, Blog, DropboxView, PublishView, Router, SettingsView, SignupView, UsernameView, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Application = require('helpers').Application;

  Router = require('router').Router;

  Blog = require('models').Blog;

  _ref = require('views'), DropboxView = _ref.DropboxView, SignupView = _ref.SignupView, SettingsView = _ref.SettingsView, PublishView = _ref.PublishView, UsernameView = _ref.UsernameView;

  exports.Calepin = (function(_super) {

    __extends(Calepin, _super);

    function Calepin() {
      return Calepin.__super__.constructor.apply(this, arguments);
    }

    Calepin.prototype.onReady = function(app) {
      var active, authorized;
      app.models.blog = new Blog(server.blog);
      authorized = app.models.blog.get("username");
      active = app.models.blog.get("valid");
      if (authorized) {
        app.views.dropbox = new DropboxView({
          model: app.models.blog
        });
        app.views.username = new UsernameView({
          model: app.models.blog
        });
      } else {
        app.views.dropbox = new SignupView;
      }
      app.views.settings = new SettingsView({
        model: app.models.blog
      });
      if (!server.blog.id) {
        app.views.settings.disable();
      }
      app.views.publish = new PublishView({
        model: app.models.blog
      });
      this.router = new Router;
      Backbone.history.start({
        pushState: true
      });
      if (server.route) {
        return this.router.navigate(server.route);
      }
    };

    return Calepin;

  })(Application);

  window.app = new exports.Calepin;
  
}});

window.require.define({"models": function(exports, require, module) {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  exports.Blog = (function(_super) {

    __extends(Blog, _super);

    function Blog() {
      this.publish = __bind(this.publish, this);

      this.set_dropbox = __bind(this.set_dropbox, this);

      this.get_dropbox = __bind(this.get_dropbox, this);

      this.url = __bind(this.url, this);
      return Blog.__super__.constructor.apply(this, arguments);
    }

    Blog.prototype.url = function() {
      return server.urls['api.blog_edit'].replace("<id>", this.id);
    };

    Blog.prototype.get_dropbox = function(callback) {
      return $.getJSON(server.urls['api.dropbox_profile'], callback);
    };

    Blog.prototype.set_dropbox = function() {
      var _this = this;
      return this.get_dropbox(function(data) {
        return _this.set({
          dropbox: data
        });
      });
    };

    Blog.prototype.publish = function(options) {
      var params;
      if (options == null) {
        options = {};
      }
      params = {
        success: function() {},
        error: function() {},
        complete: function() {},
        type: "POST",
        url: server.urls['api.publish'].replace("<id>", this.id)
      };
      params = _.extend(params, options);
      return $.ajax(params);
    };

    Blog.prototype.validate = function(attrs) {
      var field, value;
      for (field in attrs) {
        value = attrs[field];
        if (field === 'username' || field === 'site') {
          if (!value) {
            return "" + field + " is required";
          }
        }
      }
      return void 0;
    };

    return Blog;

  })(Backbone.Model);
  
}});

window.require.define({"router": function(exports, require, module) {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  exports.Router = (function(_super) {

    __extends(Router, _super);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.routes = {
      "": "main"
    };

    Router.prototype.main = function() {};

    return Router;

  })(Backbone.Router);
  
}});

window.require.define({"templates/dropbox": function(exports, require, module) {
  module.exports = function (__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
      
        __out.push('<h4><strike>Step 1: <strong>Sign up</strong></strike></h4>\n\n<p>Logged in as <strong>');
      
        __out.push(__sanitize(this.username));
      
        __out.push('</strong></p>\n\n<div class="actions">\n  <a href="#" class="button logout">Logout</a>\n</div>\n\n<div class="username-edit">\n  <div class="field">\n    <label for="f_username">Username</label>\n    <input type="text" name="username" id="f_username" class="small" autocomplete="off">\n    <input type="submit" value="Update"> <span class="status"></span>\n    <div class="availability"></div>\n  </div>\n</div>\n\n<hr>\n\n<div class="delete">\n  <a href="#" class="danger">Delete Calepin Account</a>\n  <p>Your posts are still safe with Dropbox</p>\n</div>');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  }
}});

window.require.define({"templates/home": function(exports, require, module) {
  module.exports = function (__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
      
      
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  }
}});

window.require.define({"templates/publish": function(exports, require, module) {
  module.exports = function (__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
      
        __out.push('<h4>Step 3. <strong>Publish</strong></h4>\n<p>Every time you hit the publish button we scan for new posts \n  and publish them on <a href="');
      
        __out.push(__sanitize(this.site_url));
      
        __out.push('">\n  ');
      
        __out.push(__sanitize(this.site_url ? this.site_url.substr(7) : "your own url"));
      
        __out.push('</a></p>\n<div class="actions">\n  <button class="publish full-width">Publish</button>\n</div>\n<div class="status"></div>\n<div class="visit"><a href="');
      
        __out.push(__sanitize(this.site_url));
      
        __out.push('">\n  ');
      
        __out.push(__sanitize(this.site_url ? this.site_url.substr(7) : void 0));
      
        __out.push('</a> is ready</div>');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  }
}});

window.require.define({"templates/publish_success": function(exports, require, module) {
  module.exports = function (__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
      
        __out.push(__sanitize(this.add ? this.add : "No"));
      
        __out.push(' new ');
      
        __out.push(__sanitize(this.add === 1 ? "post" : "posts"));
      
        __out.push('<br>\n');
      
        __out.push(__sanitize(this.edit ? this.edit : "No"));
      
        __out.push(' updated ');
      
        __out.push(__sanitize(this.edit === 1 ? "post" : "posts"));
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  }
}});

window.require.define({"templates/settings": function(exports, require, module) {
  module.exports = function (__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
      
        __out.push('<h4>Step 2. <strong>Configure</strong></h4>\n<form action="" methods="POST">\n  <div class="mapping">\n    <div class="field">\n      <label for="f_sitename">Site Title *</label>\n      <input type="text" id="f_sitename" value="');
      
        __out.push(__sanitize(this.sitename));
      
        __out.push('" name="sitename">\n    </div>\n    <div class="field">\n      <label for="f_disqus">Disqus Site Name <span>(enables comments)</span></label>\n      <input type="text" id="f_disqus" value="');
      
        __out.push(__sanitize(this.disqus));
      
        __out.push('" name="disqus">\n    </div>\n    <div class="field">\n      <label for="f_twitter">Twitter <span>(for an avatar and <em>Follow</em> button)</span></label> \n      <input type="text" id="f_twitter" value="');
      
        __out.push(__sanitize(this.twitter));
      
        __out.push('" name="twitter">\n    </div>\n    <div class="field">\n      <label for="f_cname">CNAME</label>\n      <input type="text" id="f_cname" value="');
      
        __out.push(__sanitize(this.cname));
      
        __out.push('" name="cname">\n      <div class="availability"></div>\n    </div>\n  </div>\n  <div class="actions">\n    <input type="submit" value="Save"> <span class="status"></span>\n  </div>\n</form>\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  }
}});

window.require.define({"templates/signup": function(exports, require, module) {
  module.exports = function (__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
      
        __out.push('<h4>Step 1. <strong>Sign up</strong></h4>\n\n<div class="signup">\n  <p>Host your blog on <em>username</em>.calepin.co</p>\n  <div class="field">\n    <label for="f_username">Username</label>\n    <input type="text" name="username" id="f_username" class="small" autocomplete="off">\n    <input type="submit" value=\'Sign up\'>\n    <div class="availability"></div>\n  </div>\n</div>\n<hr>\n<div class="actions login">\n  Already a Calepin user? <input type="submit" value=\'Dropbox Login\'>\n</div>');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  }
}});

window.require.define({"views": function(exports, require, module) {
  var UsernameInputView, dropbox_tpl, publish_success_tpl, publish_tpl, settings_tpl, signup_tpl,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  signup_tpl = require('templates/signup');

  dropbox_tpl = require('templates/dropbox');

  settings_tpl = require('templates/settings');

  publish_tpl = require('templates/publish');

  publish_success_tpl = require('templates/publish_success');

  exports.ToggleView = (function(_super) {

    __extends(ToggleView, _super);

    function ToggleView() {
      this.enable = __bind(this.enable, this);

      this.disable = __bind(this.disable, this);
      return ToggleView.__super__.constructor.apply(this, arguments);
    }

    ToggleView.prototype.disable = function() {
      (this.$(":input")).attr("disabled", "disabled");
      return ($(this.el)).addClass("disabled");
    };

    ToggleView.prototype.enable = function() {
      (this.$(":input")).removeAttr("disabled");
      return ($(this.el)).removeClass("disabled");
    };

    return ToggleView;

  })(Backbone.View);

  UsernameInputView = (function(_super) {

    __extends(UsernameInputView, _super);

    function UsernameInputView() {
      this.keydown = __bind(this.keydown, this);

      this.validate = __bind(this.validate, this);

      this.reset = __bind(this.reset, this);

      this.sanitize = __bind(this.sanitize, this);
      return UsernameInputView.__super__.constructor.apply(this, arguments);
    }

    UsernameInputView.prototype.TIMEOUT_MS = 800;

    UsernameInputView.prototype.MIN_LENGTH = 2;

    UsernameInputView.prototype.events = {
      "focus": "reset",
      "blur": "sanitize",
      "keydown": "keydown"
    };

    UsernameInputView.prototype.initialize = function(options) {
      this.$field = ($(this.el)).parent();
      this.$availability = this.$field.find(".availability");
      if (this.model) {
        return this.el.value = this.model.get("username");
      }
    };

    UsernameInputView.prototype.clean = function(s) {
      s = s.replace(/[^-_a-zA-Z0-9,&\s]+/ig, '');
      return s.replace(/\s/gi, '-');
    };

    UsernameInputView.prototype.sanitize = function(e) {
      this.el.value = this.clean(this.el.value);
      return this.$availability.html("");
    };

    UsernameInputView.prototype.reset = function() {
      this.valid = false;
      this.$availability.html("");
      return this.$field.removeClass("available");
    };

    UsernameInputView.prototype.validate = function(options) {
      var clean,
        _this = this;
      if (options == null) {
        options = {};
      }
      this.reset();
      if (!this.el.value) {
        return;
      }
      clean = this.clean(this.el.value);
      if (this.el.value !== clean) {
        return this.$availability.html("" + this.el.value + " won't fit in a URL. How about " + clean + "?");
      }
      return $.post(server.urls['api.availability'], {
        username: this.el.value
      }, function(data) {
        var message;
        if (data.available) {
          message = "" + _this.el.value + "</em>.calepin.co is available!";
          _this.$field.addClass("available");
        } else {
          message = "<em>" + _this.el.value + "</em>.calepin.co is taken";
        }
        _this.$availability.html(message);
        if (options.success) {
          return options.success(data);
        }
      });
    };

    UsernameInputView.prototype.keydown = function(e) {
      clearTimeout(this.validateTimeout);
      if (this.el.value.length > this.MIN_LENGTH) {
        return this.validateTimeout = setTimeout(this.validate, this.TIMEOUT_MS);
      }
    };

    return UsernameInputView;

  })(Backbone.View);

  exports.SignupView = (function(_super) {

    __extends(SignupView, _super);

    function SignupView() {
      this.login = __bind(this.login, this);

      this.signup = __bind(this.signup, this);

      this.render = __bind(this.render, this);
      return SignupView.__super__.constructor.apply(this, arguments);
    }

    SignupView.prototype.el = "#dropbox";

    SignupView.prototype.initialize = function(options) {
      return this.render();
    };

    SignupView.prototype.events = {
      "click .signup input[type=submit]": "signup",
      "click .login input[type=submit]": "login"
    };

    SignupView.prototype.render = function() {
      ($(this.el)).html(signup_tpl());
      this.username_view = new UsernameInputView({
        el: ($("input[name=username]", this.el)).get(0)
      });
      return this;
    };

    SignupView.prototype.signup = function(e) {
      var success, url,
        _this = this;
      e.preventDefault();
      url = server.urls['frontend.signup'];
      success = function(data) {
        data = {
          username: _this.username_view.el.value
        };
        return $.post(url, data, function(data) {
          return window.location = data.redirect;
        });
      };
      if (this.username_view.valid) {
        success({
          availalable: true
        });
      }
      return {
        "else": this.username_view.validate({
          success: success
        })
      };
    };

    SignupView.prototype.login = function(e) {
      var _this = this;
      e.preventDefault();
      return $.post(server.urls['frontend.login'], {}, function(data, status) {
        return window.location = data.redirect;
      });
    };

    return SignupView;

  })(Backbone.View);

  exports.UsernameView = (function(_super) {

    __extends(UsernameView, _super);

    function UsernameView() {
      this.submit = __bind(this.submit, this);

      this.error = __bind(this.error, this);

      this.render = __bind(this.render, this);
      return UsernameView.__super__.constructor.apply(this, arguments);
    }

    UsernameView.prototype.el = ".username-edit";

    UsernameView.prototype.initialize = function(options) {
      this.model.bind("error", this.error);
      this.$username = this.$("input[name=username]");
      return this.render();
    };

    UsernameView.prototype.events = {
      "click input[type=submit]": "submit"
    };

    UsernameView.prototype.render = function() {
      this.username_view = new UsernameInputView({
        el: this.$username.get(0),
        model: this.model
      });
      return this;
    };

    UsernameView.prototype.error = function(model, message) {
      var $status;
      $status = (this.$(".status")).addClass("show");
      return $status.html(message);
    };

    UsernameView.prototype.submit = function(e) {
      var $status,
        _this = this;
      e.preventDefault();
      if (this.completedTimeout) {
        clearTimeout(this.completedTimeout);
      }
      $status = (this.$(".status")).addClass("show");
      if (this.$username.val()) {
        $status.html("Saving ...");
      } else {
        $status.html("Invalid username");
      }
      return this.model.save({
        username: this.$username.val()
      }, {
        error: function(model, response) {
          return $status.html(response);
        },
        success: function(data) {
          $status.html("Saved");
          return _this.completedTimeout = setTimeout(function() {
            return status.removeClass("show");
          }, 1500);
        }
      });
    };

    return UsernameView;

  })(Backbone.View);

  exports.DropboxView = (function(_super) {

    __extends(DropboxView, _super);

    function DropboxView() {
      this["delete"] = __bind(this["delete"], this);

      this.logout = __bind(this.logout, this);

      this.render = __bind(this.render, this);
      return DropboxView.__super__.constructor.apply(this, arguments);
    }

    DropboxView.prototype.el = "#dropbox";

    DropboxView.prototype.events = {
      "click a.logout": "logout",
      "click .delete a": "delete"
    };

    DropboxView.prototype.initialize = function(options) {
      return this.render();
    };

    DropboxView.prototype.render = function() {
      ($(this.el)).html(dropbox_tpl(this.model.toJSON()));
      return this;
    };

    DropboxView.prototype.logout = function(e) {
      var _this = this;
      e.preventDefault();
      return $.post(server.urls['api.logout'], {}, function(data) {
        return window.location = server.urls['frontend.site'];
      });
    };

    DropboxView.prototype["delete"] = function(e) {
      var _this = this;
      e.preventDefault();
      if (!confirm("Delete your Calepin account? You can sign up for a Calepin again anytime.")) {
        return;
      }
      return app.models.blog.destroy({
        success: function(data) {
          return window.location = "";
        }
      });
    };

    return DropboxView;

  })(Backbone.View);

  exports.SettingsView = (function(_super) {

    __extends(SettingsView, _super);

    function SettingsView() {
      this.submit = __bind(this.submit, this);

      this.render = __bind(this.render, this);
      return SettingsView.__super__.constructor.apply(this, arguments);
    }

    SettingsView.prototype.el = "#settings";

    SettingsView.prototype.events = {
      "submit form": "submit"
    };

    SettingsView.prototype.initialize = function(options) {
      return this.render();
    };

    SettingsView.prototype.render = function() {
      var _this = this;
      ($(this.el)).html(settings_tpl(this.model.toJSON()));
      if (!this.model.get("sitename")) {
        this.model.get_dropbox(function(data) {
          return (_this.$("[name=sitename]")).val(data.display_name);
        });
      }
      return this;
    };

    SettingsView.prototype.submit = function(e) {
      var $status,
        _this = this;
      e.preventDefault();
      if (this.completedTimeout) {
        clearTimeout(this.completedTimeout);
      }
      $status = $(".status", this.el);
      $status.addClass("show").html("Saving ...");
      return this.model.save({
        cname: (this.$("[name=cname]")).val(),
        sitename: (this.$("[name=sitename]")).val(),
        disqus: (this.$("[name=disqus]")).val(),
        twitter: (this.$("[name=twitter]")).val()
      }, {
        success: function(data) {
          $status.html("Saved");
          return _this.completedTimeout = setTimeout(function() {
            return $status.removeClass("show");
          }, 1500);
        }
      });
    };

    return SettingsView;

  })(exports.ToggleView);

  exports.PublishView = (function(_super) {

    __extends(PublishView, _super);

    function PublishView() {
      this.publish = __bind(this.publish, this);

      this.track = __bind(this.track, this);

      this.render = __bind(this.render, this);
      return PublishView.__super__.constructor.apply(this, arguments);
    }

    PublishView.prototype.el = "#publish";

    PublishView.prototype.events = {
      "click button.publish": "publish"
    };

    PublishView.prototype.initialize = function(options) {
      this.model.bind("change", this.render);
      return this.render();
    };

    PublishView.prototype.render = function() {
      ($(this.el)).html(publish_tpl(this.model.toJSON()));
      if (this.model.get("valid")) {
        this.enable();
      } else {
        this.disable();
      }
      return this;
    };

    PublishView.prototype.track = function() {
      var args;
      args = ['_trackEvent', 'Interface', 'Published', this.model.get("username")];
      if (window._gaq) {
        return window._gaq.push(args);
      }
    };

    PublishView.prototype.publish = function(e) {
      var _this = this;
      e.preventDefault();
      (this.$(".status")).html("Syncing & Publishing");
      this.disable();
      return this.model.publish({
        success: function(data) {
          return (_this.$(".status")).html(publish_success_tpl(data));
        },
        error: function(data) {
          return (_this.$(".status")).html("Server error encountered");
        },
        complete: function(xhr, status) {
          _this.enable();
          _this.track();
          return (_this.$(".visit")).css({
            opacity: "1"
          });
        }
      });
    };

    return PublishView;

  })(exports.ToggleView);
  
}});

