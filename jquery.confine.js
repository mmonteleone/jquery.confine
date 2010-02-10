 /**
  * jQuery.confine - Textarea maxlength, Done Right.
  *
  * version 0.9.2
  *
  * http://michaelmonteleone.net/projects/confine
  * http://github.com/mmonteleone/jquery.confine
  *
  * Copyright (c) 2009 Michael Monteleone
  * Licensed under terms of the MIT License (README.markdown)
  */
(function($){    
    /**
     * Helpers
     */
    var eventName = 'maxlength', 
        currentJqSupportsLive = Number($.fn.jquery.split('.').slice(0,2).join('.')) >= 1.4,
        /**
         * Returns whether the key event contains a simultaneous modifier 
         * @param {Event} e key event
         * @returns whether a modifier key was held during event
         */
        inChord = function(e) {
            return !!e.ctrlKey || 
                !!e.ctrlLeft || 
                !!e.altKey || 
                !!e.altLeft || 
                !!e.metaKey;            
        },
        /**
         * Returns whether a keycode can be considered a non-value key
         * @param {Number} code key code
         * @returns boolean
         */
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
        /**
         * Manually clips a text area that exceeds a given length
         * and triggers maxlength event
         * @param {jQuery} area jQuery selection of a text area
         * @param {Number} length max length to allow
         */
        clip = function(area, length) {
            var val = area.val();
            if(val.length > length) {
                area.val(val.substring(0, length));                
                area.trigger(eventName);
            }
        };
        
    /**
     * Main plugin code
     */
    $.fn.confine = function(options) {
        var settings = $.extend({}, $.fn.confine.defaults, options || {});

        // throw exception if live set but no jq 1.4 or greater
        if(!currentJqSupportsLive && settings.live) {
            throw("Use of the live option requires jQuery 1.4 or greater");
        }

        var area, max, binder = settings.live ? 'live' : 'bind';  
        
        return this
            // bind via `live` or `bind` depending on jquery version
            [binder]('keydown', function(e){
                area = $(this);
                // use the textarea's maxlength attribute value if there,
                // otherwise, the explicitly passed `maxlength` option
                max = area.attr(settings.attribute) || settings.maxlength;
                if(max !== null) {
                    // if at max length, only allow non character keys or 
                    // character keys that occurred with modifiers
                    if(!inChord(e) && 
                        !isControlKey(e.keyCode) && 
                        area.val().length >= max) 
                    {
                        area.trigger(eventName);
                        return false;
                    }                    
                }
            })
            // bind via `live` or `bind` depending on jquery version
            [binder]('paste', function(){
                var area = $(this);
                // pasted text is not present in text area until
                // *after* the paste event occurs, so we need an ugly 1ms timeout
                // before clipping
                settings.global.setTimeout(function(){ 
                    max = area.attr(settings.attribute) || settings.maxlength;
                    if(max !== null) { clip(area, max); }
                }, 1);
            })
            .each(function(){
                // enforce maxlength on initialization of plugin
                // for all matched textareas
                area = $(this);
                max = area.attr(settings.attribute) || settings.maxlength;
                if(max !== null) { clip(area, max); }
            });
    };
    /**
     * Shortcut alias for
     * $('textarea').confine(options);
     *
     * @param {Object} options optional object literal of options
     */
    $.confine = function(options){
        return $($.fn.confine.defaults.selector).confine(options);
    };
    
    $.extend($.fn.confine, {
        version: '0.9.2',
        defaults: {
            // maxlength to apply to matched textareas.  If textareas provide 
            // their own maxlength via the `data-maxlength` attribute, they will override this value.
            maxlength: null, 
            // whether to monitor matched text areas via `live` instead of `bind`, 
            // allowing for live binding of `maxlength` by calling code and for 
            // confining of matching textareas added to the DOM after activation.
            live: currentJqSupportsLive,
            // Name of the optional attribute to look for on matched textareas 
            // to provide a maxlength value.  When available, overrides the 
            // `maxlength` value passed through the `confine()` activation call.
            attribute: 'data-maxlength',
            // default selector when using the `$.confine()` shortcut activation
            selector: 'textarea',
            global: window
        }
    });
})(jQuery);
