jQuery.confine
==============
Textarea maxlength Done Right.  
[http://github.com/mmonteleone/jquery.confine][0]

HTML textareas do not natively implement a `maxlength` attribute like text inputs.  jQuery.confine is a simple jQuery plugin which implements this *correctly*, avoiding many of the problems most naive implementations run into, while also optionally taking advantage of new HTML5 standards and live event support in jQuery 1.4.

Seriously, textarea maxlength?  Hasn't this problem been solved before?  Like 5,000 times?
------------------------------------------------------------------------------

No, it's probably more like 10,000 times.  Since the dawn of JavaScript.  In fact, many jQuery users' first attempt at plugin authoring involves some variation of textarea maxlength like the following where it watches for keyup events and trims the textarea's value whenever it goes over:

    // this is not confine... just a naive maxlength implementation
    
    $.fn.maxlength = function(max) {
        return this.bind('keyup', function(){
            if($(this).val() > max)
                $(this).val($(this).val().substring(0, length));
        });  
    };

And this common approach seems to work just fine, except for a few issues:

  1. User-unfriendliness of the slight text blink and change in cursor placement that occurs after each keystroke over the maxlength
  2. If a user tries inserting new text in the middle of a textarea that pushes it over the maxlength, it would end up allowing the new text, while truncating the end, sometimes without the user noticing since it might be past a scroll break.  
  3. Pasted text will not be enforced by the maxlength
  
At its core, jQuery.confine cancels the typing events themselves before they even have a chance to modify the textarea's value.  So, typing past the max acts just like typing past the max in a text input - it does nothing.  It also has some more smarts:

Benefits of Confine
-------------------

  * Enforces maxlength by fully canceling key events before the textarea's text is even modified
  * Still allows control keys to be pressed even when the maxlength is reached, allowing for arrow keys, backspaces, deletes, etc.
  * Still allows modifier keys like `ctrl` and `cmd` to be combined with non-modifiers even when at the maxlength, so the user can select all via `ctrl`-`a` or cut via `ctrl`-`x`.
  * Raises a custom 'maxlength' event on matched textareas whenever a maxlength is reached
  * Enforces maxlength of pasted text
  * Enforces maxlength on initial text already in textareas before changes occur
  * Optionally supports declaratively stating the maxlength value via an HTML5-valid attribute `data-maxlength`
  * Supports both jQuery 1.3 and 1.4, but with jQuery 1.4, works in a `live` fashion so that maxlength is enforced on all matched elements, not just the ones in the DOM at the time of activation.
  * Fully unit tested and stable

And this is how you use it:
---------------------------

**Confines textareas to maxlength of 250 characters**

    <textarea name="comments"></textarea>
    
    $('textarea').confine({maxlength: 250});
    
**Confines textareas to individual maxlengths defined by HTML5-valid attribute,** `data-maxlength`

    <textarea name="description" data-maxlength="200"></textarea>
    <textarea name="comments" data-maxlength="500"></textarea>
    
    $('textarea').confine();

Requirements, installation, and notes
-------------------------------------

jQuery.confine requires:

* [jQuery][3] 1.3.2 or greater

You can download the [zipped release][8] containing a minified build with examples and documentation or the development master with unit tests by cloning `git://github.com/mmonteleone/jquery.confine.git`.

jQuery.confine requires [jquery][3] 1.3.2 or greater, and [jQuery.confine][9] 0.9 and can be installed thusly 

    <script type="text/javascript" src="jquery-1.4.1.min.js"></script>
    <script type="text/javascript" src="jquery.confine.min.js"></script>

jQuery.confine includes a full unit test suite, and has been verified to work against Firefox 3.5, Safari 4, Internet Explorer 6,7,8, Chrome, and Opera 9 and 10.  Please feel free to test its suite against other browsers.

jQuery 1.4 Bonus
----------------

Confine works great with jQuery 1.3, but it's even better with 1.4.  When used with jQuery 1.4, jQuery.confine automatically assumes monitoring textareas via `.live()` instead of `.bind()`, allowing for client code to add more textareas after a jQuery.confine activation that will still be bound by confine, as well as allowing for binding to `maxlength` via `.live()` instead of `.bind()`.

This behavior is only available with jQuery 1.4 and can be overridden by specifying the 'live' boolean option.

Complete API
------------

### Activation

Within the `document.ready` event, call

    $('textarea').confine(options);

where options is an optional object literal of options.  This registers the matched controls to raise the new events.

Confining matched text areas to 250 characters:

    $('textarea').confine({maxlength: 250});
    
If textareas have an HTML5-valid data-maxlength attribute, can simply call:

    // assuming...
    <textarea data-maxlength="250"></textarea>
    <textarea data-maxlength="300"></textarea>
    
    $('textarea').confine();   

As a shortcut,    

    $.confine(options);  

is an alias for `$('textarea').confine(options);`  

### Options

* **maxlength**: The maxlength to apply to matched textareas.  If textareas provide their own maxlength via the `data-maxlength` attribute, they will override this value.
  * *default*: *undefined*
* **selector**: default selector when using the `$.confine()` shortcut activation
  * *default*: `'textarea'`
* **attribute**: Name of the optional attribute to look for on matched textareas to provide a maxlength value.  When available, overrides the `maxlength` value passed through the `confine()` activation call.
  * *default*: `'data-maxlength'`  Custom attributes beginning with 'data-' are considered valid in HTML5.
* **live**: whether to monitor matched text areas via `live` instead of `bind`, allowing for live binding of `maxlength` by calling code and for confining of matching textareas added to the DOM after activation.
  * *default*: `true` when using jQuery 1.4 or greater.  `false` otherwise.  Passing `true` without jQuery 1.4 or greater throws an exception.


### Events

* **maxlength**:  raised on matching textarea whenever an attempt is made to *exceed* its maxlength.  Does not fire when maxlength is simply reached.


How to Contribute
-----------------

Development Requirements (for building and test running):

* Ruby + Rake, PackR, rubyzip gems: for building and minifying
* Java: if you want to test using the included [JsTestDriver][6] setup

Clone the source at `git://github.com/mmonteleone/jquery.confine.git` and have at it.

The following build tasks are available:

    rake build     # builds package and minifies
    rake test      # runs jQuery.confine specs against QUnit testrunner in default browser
    rake server    # downloads, starts JsTestDriver server, binds common browsers
    rake testdrive # runs jQuery.confine specs against running JsTestDriver server
    rake release   # builds a releasable zip package

&lt;shameless&gt;Incidentally jQuery.confine's unit tests use QUnit along with one some of my other projects, [Pavlov][4], a behavioral QUnit extension and [Delorean][9], an accurate JavaScript time passage fake. &lt;/shameless&gt;

Changelog
---------

* 0.9.2 - Changed behavior for when `confine()` is applied without `maxlength` option to a textarea that also has no `data-maxlength` attribute -- no longer confines to 0 nor any other assumed max length in this scenario.
* 0.9.1 - Added jQuery 1.4.1 live support and html5 data attribute support
* 0.9.0 - Initial Release

License
-------

The MIT License

Copyright (c) 2009 Michael Monteleone, http://michaelmonteleone.net

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: http://github.com/mmonteleone/jquery.confine "jQuery.confine"
[1]: http://michaelmonteleone.net "Michael Monteleone"
[3]: http://jquery.com "jQuery"
[4]: http://github.com/mmonteleone/pavlov "Pavlov"
[6]: http://code.google.com/p/js-test-driver/ "JsTestDriver"
[7]: http://github.com/mmonteleone/jquery.confine/raw/master/jquery.confine.js "raw confine script"
[8]: http://cloud.github.com/downloads/mmonteleone/jquery.confine/jquery.confine.zip "jQuery.confine Release"
[9]: http://github.com/mmonteleone/delorean "DeLorean"
