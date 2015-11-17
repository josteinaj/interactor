/*
The MIT License (MIT)

Copyright (c) 2015 Benjamin Cordier
Modified by Jostein Austvik Jacobsen, 2015

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var Interactor = function (config) {
    this.__init__(config);
};

Interactor.prototype = {

    // Initialization
    __init__: function (config) {
        this.interactions           = config.interactions           || true;
        this.interactionSelector    = config.interactionSelector    || '*',
        this.interactionEvents      = config.interactionEvents      || ['click'];
        this.conversions            = config.coversions             || false;
        this.conversionSelector     = config.conversionSelector     || '*';
        this.conversionEvents       = config.conversionEvents       || ['click'];
        this.focus                  = config.focus                  || false;
        this.focusSelector          = config.focusSelector          || '*';
        this.focusEvents            = config.focusEvents            || ['focus'];
        this.mousePosition          = config.mousePosition          || false;
        this.endpoint               = config.endpoint               || '/interactions';
        this.listenForDomChange     = config.listenForDomChange     || true;
        
        this.lastMouseEvent         = null;
        this.records                = [];
        this.loadTime               = new Date();
        this.__createEvents__();
    },
    
    // Get path to element, based on http://stackoverflow.com/a/4588211/281065
    __xpath__: function(el){
        var names = [];
        while (el.parentNode){
            if (el.id){
                names.unshift("//"+(el.tagName+"").toLowerCase()+"[@id='"+el.id+"']");
                break;
            }else{
                if (el==el.ownerDocument.documentElement) names.unshift("/"+(el.tagName+"").toLowerCase());
                else{
                    for (var c=1,e=el;e.previousElementSibling;e=e.previousElementSibling,c++);
                        names.unshift(
                            (el.tagName+"").toLowerCase()+"["+c+"]"
                            +((el.className !== null && el.className !== "") ? "[@class='"+el.className+"']" : "")
                            +((el.getAttribute("name") !== null && el.getAttribute("name") !== "") ? "[@name='"+el.getAttribute("name")+"']" : "")
                            +((el.getAttribute("src") !== null && el.getAttribute("src") !== "") ? "[@name='"+el.getAttribute("src")+"']" : "")
                            +((el.getAttribute("href") !== null && el.getAttribute("href") !== "") ? "[@name='"+el.getAttribute("href")+"']" : "")
                        );
                }
                el=el.parentNode;
            }
        }
        return names.join("/");
    },

    // Create Events to Track
    __createEvents__: function () {
        var Interaction     = this;
        var observer;

        // Set Interaction Capture
        if (Interaction.interactions === true) {
            for (var i = 0; i < Interaction.interactionEvents.length; i++) {
                var ev = Interaction.interactionEvents[i],
                    targets = document.querySelectorAll(Interaction.interactionSelector);
                for (var j = 0; j < targets.length; j++) {
                    targets[j].addEventListener(ev, function (e) {
                        //e.stopPropagation();
                        Interaction.__addInteraction__(e, "interaction");
                    });
                }
                
                // in case of DOM change
                if (typeof MutationObserver === "function") {
                    observer = new MutationObserver(function(mutations) {
                        mutations.forEach(function(mutation) {
                            for (var n = 0; n < mutation.addedNodes.length; n++) {
                                mutation.addedNodes[n].addEventListener(ev, function (e) {
                                    //e.stopPropagation();
                                    Interaction.__addInteraction__(e, "interaction");
                                });
                            }
                        });
                    });
                    observer.observe(document.documentElement, {
                        attributes: false,
                        characterData: false,
                        childList: true,
                        subtree: true
                    });
                }
            }
        }

        // Set Conversion Capture
        if (Interaction.conversions === true) {
            for (var i = 0; i < Interaction.conversionEvents.length; i++) {
                var ev = Interaction.events[i],
                targets = document.querySelectorAll(Interaction.conversionSelector);
                for (var j = 0; j < targets.length; j++) {
                    targets[j].addEventListener(ev, function (e) {
                        //e.stopPropagation();
                        Interaction.__addInteraction__(e, "conversion");
                    });
                }
                
                // in case of DOM change
                if (typeof MutationObserver === "function") {
                    observer = new MutationObserver(function(mutations) {
                        mutations.forEach(function(mutation) {
                            for (var n = 0; n < mutation.addedNodes.length; n++) {
                                mutation.addedNodes[n].addEventListener(ev, function (e) {
                                    //e.stopPropagation();
                                    Interaction.__addInteraction__(e, "conversion");
                                });
                            }
                        });
                    });
                    observer.observe(document.documentElement, {
                        attributes: false,
                        characterData: false,
                        childList: true,
                        subtree: true
                    });
                }
            }
        }
        
        // Set Focus Capture
        if (Interaction.focus === true) {
            for (var i = 0; i < Interaction.focusEvents.length; i++) {
                var ev = Interaction.focusEvents[i],
                    targets = document.querySelectorAll(Interaction.focusSelector);
                for (var j = 0; j < targets.length; j++) {
                    targets[j].addEventListener(ev, function (e) {
                        //e.stopPropagation();
                        Interaction.__addInteraction__(e, "focus");
                    });
                }
                
                // in case of DOM change
                if (typeof MutationObserver === "function") {
                    observer = new MutationObserver(function(mutations) {
                        mutations.forEach(function(mutation) {
                            for (var n = 0; n < mutation.addedNodes.length; n++) {
                                mutation.addedNodes[n].addEventListener(ev, function (e) {
                                    //e.stopPropagation();
                                    Interaction.__addInteraction__(e, "focus");
                                });
                            }
                        });
                    });
                    observer.observe(document.documentElement, {
                        attributes: false,
                        characterData: false,
                        childList: true,
                        subtree: true
                    });
                }
            }
        }
        
        // Set Mouse Capture
        if (Interaction.mousePosition === true) {
            window.setInterval(function(){
                if (Interaction.lastMouseEvent !== null && new Date().getTime() - Interaction.lastMouseEvent.timeStamp > 250) {
                    Interaction.__addInteraction__(Interaction.lastMouseEvent, "mousePosition");
                    Interaction.lastMouseEvent = null;
                }
            }, 250);
            
            document.onmousemove = function(e) {
                if (Interaction.lastMouseEvent === null) {
                    Interaction.lastMouseEvent = e;
                }
            };
        }

        // Bind onbeforeunload Event
        window.onbeforeunload = function (e) {
            Interaction.__sendInteractions__();
        };
    },

    // Add Interaction Triggered By Events
    __addInteraction__: function (e, type) {
        var Interaction     = this,
            interaction     = {
                type            : type,
                event           : e.type,
                targetTag       : e.path[0].tagName.toLowerCase(),
                targetClasses   : e.path[0].className,
                content         : e.path[0].innerText,
                xpath           : Interaction.__xpath__(e.path[0]),
                clientPosition  : {
                    x               : e.clientX,
                    y               : e.clientY
                },
                screenPosition  : {
                    x               : e.screenX,
                    y               : e.screenY
                },
                scrollTop       : document.body.scrollTop,
                createdAt       : new Date()
            };
        Interaction.records.push(interaction);
        return this.interactions;
    },

    // Gather additional data and send interaction(s) to server
    __sendInteractions__: function () {
        var Interaction     = this,
            data            = {
                loadTime        : Interaction.loadTime,
                unloadTime      : new Date(),
                language        : window.navigator.language,
                platform        : window.navigator.platform,
                port            : window.location.port,
                client          : {
                    name            : window.navigator.appVersion,
                    innerWidth      : window.innerWidth,
                    innerHeight     : window.innerHeight,
                    outerWidth      : window.outerWidth,
                    outerHeight     : window.outerHeight
                },
                page            : {
                    location        : window.location.pathname,
                    href            : window.location.href,
                    origin          : window.location.origin,
                    title           : document.title
                },
                interactions    : Interaction.records
            },
            ajax            = new XMLHttpRequest();
        ajax.open('POST', Interaction.endpoint, false);
        ajax.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        ajax.send(JSON.stringify(data));
    }
};