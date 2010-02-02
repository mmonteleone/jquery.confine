QUnit.specify("jQuery.confine", function() {
    var specification = function() {
        
        // setup some helpers        

        // capture local references to current jquery objects
        // since the globals may get out of sync in the async
        // test runner
        var $ = window.$,
            jQuery = window.jQuery;
        var is14OrGreater = Number($.fn.jquery.split('.').slice(0,2).join('.')) >= 1.4;
        var binderMethod = is14OrGreater ? 'live' : 'bind';
        
        // simulates the behavior of a paste
        $.fn.simulatePaste = function(value) {
            return this.each(function(){
                var area = $(this);
                area.trigger('paste')       // triggers event first
                    .val(area.val()+value); // and then changes value (just like real)
            });
        }
        
        var fakeGlobal = {
            setTimeout: DeLorean.setTimeout
        };

        // shortcut for building up and breaking down stub forms
        var FormBuilder = {
            clear: function(){
                $('div#testbed form').empty();
                $('textarea').die('paste');
                $('textarea').die('keydown');
            },
            addTextArea: function(name, value){
                var input = $('<textarea class="test" name="' + name + '" id="' + name + '">' + value + '</textarea>');
                $('div#testbed form').append(input);
                return input;
            }
        };
        
        describe("jQuery.confine", function(){
            it("should be equivalent to calling jQuery( jQuery.fn.confine.defaults.selector ).confine( options );", function(){
                FormBuilder.addTextArea("text1","text1val1");
                FormBuilder.addTextArea("text2","text2val2");
                FormBuilder.addTextArea("text3","text3val3");

                var originalConfine = $.fn.confine;
                try{
                    var passedOptions;
                    var selection;
                    $.fn.confine = function(opts) {
                        passedOptions = opts;                                        
                        selection = this;
                    };
                    $.extend($.fn.confine, {defaults:originalConfine.defaults});
                    var someOpts = {a:1,b:2};
                    $.confine(someOpts);
                    assert(someOpts).isSameAs(passedOptions);
                    assert(selection.size()).equals(3);  
                } finally {
                    $.fn.confine = originalConfine;
                }         
            });            
        });
                
        describe("defaults", function(){
            it("should have a value of 'window' for global", function(){
                assert($.fn.confine.defaults.global).isSameAs(window);
            });
            it("should have proper live setting (true if >= 1.4)", function(){
                if(is14OrGreater) {
                    assert($.fn.confine.defaults.live).isTrue("should be true");
                } else {
                    assert($.fn.confine.defaults.live).isFalse("should be false");                        
                }                
            });
            it("should have a default attribute of 'data-maxlength'", function(){
                assert($.fn.confine.defaults.attribute).equals('data-maxlength');
            })
        });
        describe("upon initial activation", function(){
            before(function(){
                FormBuilder.addTextArea('t1','abcde');                
                FormBuilder.addTextArea('t2','abcde');                
                FormBuilder.addTextArea('t3','abcde');                
            });
            
            after(function(){
                FormBuilder.clear();
            });
            
            it("should throw an exception when specifying live when jq version doesn't support (<1.4 only)", function(){
                if(is14OrGreater) {
                    try{
                        $('textarea').confine({maxlength:5, live:true});
                    } catch(e) {
                        assert.fail('should have allowed live when 1.4');
                    }
                } else {
                    assert(function(){
                        $('textarea').confine({maxlength:5, live:true});
                    }).throwsException('Use of the live option requires jQuery 1.4 or greater');
                }                
            });
            if(is14OrGreater) {                
                it("should register paste and keydown with live when live specified as true", function(){
                    var originalLive = $.fn.live;
                    try {
                        var calls = [];
                        $.fn.live = function(eventName) {
                            calls.push(eventName);
                            return this;
                        };
                        $('textarea').confine({maxlength:5, live:true});                        
                        assert(calls).isSameAs(['keydown','paste']);
                    } finally {
                        $.fn.live = originalLive;
                    }
                });
            }
            it("should register paste and keydown with bind when live specified as false", function(){
                var originalBind = $.fn.bind;
                try {
                    var calls = [];
                    $.fn.bind = function(eventName) {
                        calls.push(eventName);
                        return this;
                    };
                    $('textarea').confine({maxlength:5, live:false});
                    assert(calls).isSameAs(['keydown','paste']);
                } finally {
                    $.fn.bind = originalBind;
                }                    
            });
            describe("when textareas default to containing less than the max length", function(){
                it("should not raise maxlength event", function(){
                    var maxLengthRaised = false;
                    $('textarea')
                        .bind('maxlength', function(){
                            maxLengthRaised = true;                            
                        })
                        .confine({maxlength: 10});
                    assert(maxLengthRaised).isFalse();
                });
                it("should not clip the content", function(){
                    $('textarea').confine({maxlength: 10});
                    assert($('textarea').val()).equals('abcde');
                });
            });
            describe("when textareas default to containing precisely the max length", function(){
                it("should not raise maxlength event", function(){
                    var maxLengthRaised = false;
                    $('textarea')
                        .bind('maxlength', function(){
                            maxLengthRaised = true;                            
                        })
                        .confine({maxlength: 5});
                    assert(maxLengthRaised).isFalse();                    
                });
                it("should not clip the content", function(){
                    $('textarea').confine({maxlength: 5});
                    assert($('textarea').val()).equals('abcde');                    
                });
            });
            describe("when textareas default to containing over the max length", function(){
                it("should raise maxlength event", function(){
                    var maxLengthRaised = false;
                    $('textarea')
                        .bind('maxlength', function(){
                            maxLengthRaised = true;                            
                        })
                        .confine({maxlength:3});
                    assert($('textarea').val()).equals('abc');
                    assert(maxLengthRaised).isTrue();
                });
                it("should clip the content to be same length as maxlength", function(){
                    $('textarea').confine({maxlength:3});
                    assert($('textarea').val()).equals('abc');
                });
            });
        });
        describe("upon typing", function(){
            before(function(){
                FormBuilder.addTextArea('t1','abcde');                
                FormBuilder.addTextArea('t2','abcde');                
                FormBuilder.addTextArea('t3','abcde');                
            });
            
            after(function(){
                FormBuilder.clear();
            });

            describe("that results in length under the max", function(){                
                it("should not raise maxlength event", function(){
                    var maxLengthRaised = false;
                    $('textarea')
                        .bind('maxlength', function(){
                            maxLengthRaised = true;                            
                        })                        
                        .confine({maxlength: 10})
                        .autotype('xyz');
                    assert(maxLengthRaised).isFalse();
                });
                it("should modify the contents as normal", function(){
                    $('textarea')
                        .confine({maxlength: 10})
                        .autotype('xyz');
                    assert($('textarea').val()).equals('abcdexyz');
                });
            });
            describe("that results in precisely max length", function(){
                it("should not raise maxlength event", function(){
                    var maxLengthRaised = false;
                    $('textarea')
                        .bind('maxlength', function(){
                            maxLengthRaised = true;                            
                        })                        
                        .confine({maxlength: 10})
                        .autotype('vwxyz');
                    assert(maxLengthRaised).isFalse();                    
                });
                it("should modify the contents as normal", function(){
                    $('textarea')
                        .confine({maxlength: 10})
                        .autotype('vwxyz');
                    assert($('textarea').val()).equals('abcdevwxyz');
                });
            });
            describe("that would result in over max length", function(){
                it("should raise maxlength event on each overage attempt", function(){
                    var events=[];
                    $('textarea')
                        .bind('maxlength', function(e){                            
                            events.push(e);
                        })                        
                        .confine({maxlength: 10})
                        .autotype('vwxyz123');
                    assert(events.length).equals(9);
                });
                it("should not modify contents as normal", function(){
                    $('textarea')
                        .confine({maxlength: 10})
                        .autotype('vwxyz');
                    assert($('textarea').val()).equals('abcdevwxyz');                    
                });
                it("should still allow control keys to be entered without raising maxlength", function(){
                    var events=[];
                    $('textarea')
                        .bind('maxlength', function(e){
                            events.push(e);
                        })                        
                        .confine({maxlength: 10})
                        .autotype('vwxyz{{ctrl}}{{shift}}{{/shift}}{{left}}{{back}}{{up}}');
                    assert(events.length).equals(0);
                });
                it("should still allow combo of modifier keys with character entries without raising maxlength", function(){
                    var events=[];
                    $('textarea')
                        .bind('maxlength', function(e){
                            events.push(e);
                        })                        
                        .confine({maxlength: 10})
                        .autotype('vwxyz{{ctrl}}a{{/ctrl}}{{meta}}a{{/meta}}{{ctrl}}c{{/ctrl}}');
                    assert(events.length).equals(0);                    
                });
            });
        });
        describe("upon pasting", function(){
            before(function(){
                FormBuilder.addTextArea('t1','abcde');                
                FormBuilder.addTextArea('t2','abcde');                
                FormBuilder.addTextArea('t3','abcde');                
            });
            
            after(function(){
                FormBuilder.clear();
            });            
            
            describe("that results in length under the max", function(){
                describe("immediately", function(){
                    it("should not raise maxlength event", function(){
                        var events = [];
                        $('textarea')
                            .bind('maxlength', function(e){
                                events.push(e);
                            })
                            .confine({maxlength: 10})
                            .simulatePaste('xyz');
                        assert(events.length).equals(0);
                    });
                });
                describe("after 2 ms", function(){
                    it("should not have raised maxlength event", function(){
                        var events = [];
                        $('textarea')
                            .bind('maxlength', function(e){
                                events.push(e);
                            })
                            .confine({maxlength:10, global:fakeGlobal})
                            .simulatePaste('xyz');
                        DeLorean.advance(10);
                        assert(events.length).equals(0);                                                        
                    });
                    it("should modify the contents as normal", function(){
                        var events = [];
                        $('textarea')
                            .bind('maxlength', function(e){
                                events.push(e);
                            })
                            .confine({maxlength:10, global:fakeGlobal})
                            .simulatePaste('xyz');
                        DeLorean.advance(10);
                        assert($('textarea').val()).equals('abcdexyz');
                    });                    
                });
            });
            describe("that results in precisely max length", function(){
                describe("immediately", function(){
                    it("should not raise maxlength event", function(){
                        var events = [];
                        $('textarea')
                            .bind('maxlength', function(e){
                                events.push(e);
                            })
                            .confine({maxlength:10, global:fakeGlobal})
                            .simulatePaste('xyz12');
                        assert(events.length).equals(0);     
                        DeLorean.advance(10);                   
                    });
                });
                describe("after 1 ms", function(){
                    it("should not raise maxlength event", function(){
                        var events = [];
                        $('textarea')
                            .bind('maxlength', function(e){
                                events.push(e);
                            })
                            .confine({maxlength:10, global:fakeGlobal})
                            .simulatePaste('xyz12');
                        DeLorean.advance(10);
                        assert(events.length).equals(0);                                                        
                    });
                    it("should modify the contents as normal", function(){
                        var events = [];
                        $('textarea')
                            .bind('maxlength', function(e){
                                events.push(e);
                            })
                            .confine({maxlength:10, global:fakeGlobal})
                            .simulatePaste('xyz12');
                        DeLorean.advance(10);
                        assert($('textarea').val()).equals('abcdexyz12');
                    });                    
                });                
            });
            describe("that would result in over max length", function(){
                describe("immediately", function(){
                    it("should not raise maxlength event", function(){
                        var events = [];
                        $('textarea')
                            .bind('maxlength', function(e){
                                events.push(e);
                            })
                            .confine({maxlength:10, global:fakeGlobal})
                            .simulatePaste('xyz1234');
                        assert(events.length).equals(0);
                    });
                });
                describe("after 1 ms", function(){
                    it("should raise maxlength event", function(){
                        var events = [];
                        $('textarea')
                            .bind('maxlength', function(e){
                                events.push(e);
                            })
                            .confine({maxlength:10, global:fakeGlobal})
                            .simulatePaste('xyz12345');
                        DeLorean.advance(10)
                        assert(events.length).equals(3);
                    });
                    it("should clip contents", function(){
                        var events = [];
                        $('textarea')
                            .bind('maxlength', function(e){
                                events.push(e);
                            })
                            .confine({maxlength:10, global:fakeGlobal})
                            .simulatePaste('xyz12');
                        DeLorean.advance(10);
                        assert($('textarea').val()).equals('abcdexyz12');
                    });
                });
            });
        });
        describe("when length declared in data attribute", function(){
            after(function(){
                FormBuilder.clear();                
            });
            it("should override passed maxlength on activation", function(){
                var area = FormBuilder.addTextArea('t1','abcde');
                area.attr('custom-maxlength-attr', 3);
                var events = [];
                $('textarea')
                    .bind('maxlength', function(){
                        events.push(this);                        
                    })
                    .confine({maxlength:10,attribute:'custom-maxlength-attr'});
                assert(events.length).equals(1);
                assert(area.val()).equals('abc');
            });
            it("should override passed maxlength on typing", function(){
                var area = FormBuilder.addTextArea('t1','ab');
                area.attr('custom-maxlength-attr', 3);
                var events = [];
                $('textarea')
                    .bind('maxlength', function(){
                        events.push(this);                        
                    })
                    .confine({maxlength:10,attribute:'custom-maxlength-attr'})
                    .autotype('cd');
                assert(events.length).equals(1);
                assert(area.val()).equals('abc');                
            });
            it("should override passed maxlength on pasting",function(){
                var area = FormBuilder.addTextArea('t1','ab');
                area.attr('custom-maxlength-attr', 3);
                var events = [];
                $('textarea')
                    .bind('maxlength', function(){
                        events.push(this);
                    })
                    .confine({maxlength:10,attribute:'custom-maxlength-attr', global:fakeGlobal})
                    .simulatePaste('wxyz');
                DeLorean.advance(10);                    
                assert(events.length).equals(1);
                assert(area.val()).equals('abw');
            });
        });
        if(is14OrGreater) {
            describe("when used with live", function(){
                after(function(){
                    FormBuilder.clear();                    
                });
                
                it("should still confine textareas added after activation", function(){
                    var events=[];
                    // bind first
                    $('textarea')
                        .confine({maxlength: 5})
                        .live('maxlength', function(){
                            events.push(this);                                                                                    
                        });
                        
                    // then add textareas
                    FormBuilder.addTextArea('t1','abcd');
                    FormBuilder.addTextArea('t2','abcd');
                    FormBuilder.addTextArea('t3','abcd');
                    
                    // type too much in all 3 newly added textareas
                    $('textarea#t1,textarea#t2,textarea#t3')
                        .autotype('ef');
                        
                    assert(events.length).equals(3);
                    assert($('textarea#t1').val()).equals('abcde');
                    assert($('textarea#t2').val()).equals('abcde');
                    assert($('textarea#t3').val()).equals('abcde');
                });
            });            
        }
    };
    
    /**
     * naive replication of $.each since 
     * jquery is not defined at this point
     */
    var each = function(items, fn) {
        for(var i=0;i<items.length;i++) {
            var item = items[i];
            fn(item);
        };
    };
    
    /**
     * run entire test suite against multiple loaded versions
     * of jquery.
     * 
     * Assumes they have each been loaded and set to notConflict(true)
     * aliased as jq14, jq13, etc.
     */
    each(["1.3.2","1.4.1"], function(version) {
        describe("in jQ " + version, function(){
            $ = jQuery = window['jq_' + version.replace(/\./g,'_')];
            specification();                    
        });        
    });    
});

