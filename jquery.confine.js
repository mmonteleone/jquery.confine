 /**
  * jQuery.confine - Textarea maxlength, Done Right.
  *
  * version 0.9.0
  *
  * http://michaelmonteleone.net/projects/confine
  * http://github.com/mmonteleone/jquery.confine
  *
  * Copyright (c) 2009 Michael Monteleone
  * Licensed under terms of the MIT License (README.markdown)
  */
(function($){    
    var eventName = 'maxlength', 
        currentJqSupportsLive = Number($.fn.jquery.split('.').slice(0,2).join('.')) >= 1.4,
        inChord = function(e) {
            return !!e.ctrlKey || 
                !!e.ctrlLeft || 
                !!e.altKey || 
                !!e.altLeft || 
                !!e.metaKey;            
        },
        isControlKey = function(code) {
            return code === 8 ||    // backspace
                code === 9 ||       // tab
                code === 46 ||      // delete 
                code === 63275 ||   // delete (webkit)
                code === 16 ||      // shift
                code === 37 ||      // left arrow
                code === 38 ||      // up arrow
                code === 39 ||      // right arrow
                code === 40 ||      // down arrow
                code === 35 ||      // end
                code === 36 ||      // home
                code === 33 ||      // page up
                code === 34 ||      // page down
                code === 63276 ||   // page up (safari)
                code === 63277 ||   // page down (safari)
                code === 19 ||      // pause/break
                code === 27 ||      // escape
                code === 45 ||      // insert
                code === 63273 ||   // home (webkit)            
                code === 91;        // start (windows)
        },
        clip = function(area, length) {
            var val = area.val();
            if(val.length > length) {
                area.val(val.substring(0, length));                
                area.trigger(eventName);
            }
        };
        
    $.fn.confine = function(options) {
        var settings = $.extend({}, $.fn.confine.defaults, options || {});

        if(!currentJqSupportsLive && settings.live) {
            throw("Use of the live option requires jQuery 1.4 or greater");
        }

        var area, max, binder = settings.live ? 'live' : 'bind';  
        
        return this
            [binder]('keydown', function(e){
                area = $(this);
                if(!inChord(e) && 
                    !isControlKey(e.keyCode) && 
                    area.val().length >= settings.maxlength) 
                {
                    area.trigger(eventName);
                    return false;
                }
            })
            [binder]('paste', function(){
                var area = $(this);
                settings.global.setTimeout(function(){ 
                    clip(area, settings.maxlength); 
                }, 1);
            })
            .each(function(){
                area = $(this);
                clip(area, settings.maxlength);
            });
    };
    $.confine = function(options){
        return $($.fn.confine.defaults.selector).confine(options);
    };
    
    $.extend($.fn.confine, {
        version: '0.9.0',
        defaults: {
            maxlength: null, 
            live: currentJqSupportsLive,
            selector: 'textarea',
            global: window
        }
    });
})(jQuery);
