/* ----------------------------------------------------------------------------
    alerter is a minimal vanilla javascript alert system, it will display a
    message, and then it will fade, it stacks with currently existant alerts.

    TESTED ON:
        IE 7, 8, 9, 10
        Latest Chrome

    Copyright Federico Ramírez <fedra.arg@gmail.com>
    Licenced under the MIT Licence

    VERSION: 1.0.0
*/

// in case some invalid javascript was loaded before
;
// alerter code, wrapped inside a self-executable anonymous function.
// undefined is passed to ensure it was not modified, as it's mutable on
// some browsers
(function (undefined) {
    "use strict";

    var defaults = {
            id: undefined, // optional id if wanted
            text: 'Default Alert Text',
            class: undefined,
            styles: {
                // the height of the alert div
                height: '50px',
                // the foreground and background colors for the alert
                backgroundColor: '#A200FF',
                color: '#FFFFFF',
                // font settings
                fontFamily: 'Segoe UI',
                fontSize: '13px',
                // default margin, padding and size
                margin: '15px',
                padding: '5px',
                minWidth: '250px'
            },
            duration: 3,
            // needed for stackable
            // these two options are for the fadeOut, and dictate how fast it is
            fadeStep: 5,
            fadeSpeed: 25,
            // show it bottom right or bottom left? 
            xOrientation: 'right', // left/right
            yOrientation: 'bottom', // top/bottom
            // when the alert is hidden, you can hook up a callback, the
            // callback is called with the options for the alert as argument
            onFadeOut: undefined,
            onClick: undefined
        },
        activeAlerts = 0,
        activeAlertsElems = [],
        extend,
        fadeOut,
        setOpacity;

    extend = function(a, b) {
        var item,
            output = {};

        for(item in a) {
            if(a[item] !== undefined) {
                output[item] = a[item];
            }
        }

        for(item in b) {
            if(b[item] !== undefined) {
                output[item] = b[item];
            }
        }

        return output;
    };

    // opacity helper, sets a value from 0 to 100
    setOpacity = function(elem, value) {
        elem.style.opacity = value/100;
        elem.style.filter = 'alpha(opacity=' + value + ')';
    };

    fadeOut = function(element, opacity, fadeStep, fadeSpeed, options) {
        var i = 0;
        var removeIndex = null;

        if(opacity - fadeStep >= 0) {
            setOpacity(element, opacity - fadeStep);
            setTimeout(function() { fadeOut(element, opacity - fadeStep, fadeStep, fadeSpeed, options); }, fadeSpeed);
        } else {
            for(i = 0; i < activeAlertsElems.length; i++) {
                if(activeAlertsElems[i] === element) {
                    removeIndex = i;
                } else if (removeIndex !== null && i > removeIndex) {
                    var diff = +options.styles.margin.replace('px', '') + (+options.styles.height.replace('px', ''));
                    if (options.yOrientation === 'top') {
                        activeAlertsElems[i].style.top = (+activeAlertsElems[i].style.top.replace('px', '') - diff) + 'px';
                    }
                    else {
                        activeAlertsElems[i].style.bottom = (+activeAlertsElems[i].style.bottom.replace('px', '') - diff) + 'px';
                    }
                }
            }
            
            activeAlertsElems.splice(i, 1);
            element.parentNode.removeChild(element);
            --activeAlerts;

            if (typeof options.onFadeOut === 'function') {
                options.onFadeOut(options);
            }
            else {
                console.error("Bad onFadeOut.");
            }
        }
    };

    /* -------------------------------------------------------------------------
        alerter initiation, call once for each alert you'd like.
    */
    window.alerter = function (conf) {
        var options,
            container;

        // if the parameter is a string, assume it's the text parameter
        if(typeof(conf) === 'string') {
            conf = { 'text' : conf };
        }

        ++activeAlerts;

        options = extend(defaults, conf);

        container = document.createElement('div');

        if (options.id && typeof options.id === 'string') {
            container.id = options.id;
        } else {
            console.error('Bad id.');
        }

        if (options.class && typeof options.class === 'string') {
            container.className = options.class;
        } else {
            console.error('Bad class.');
        }

        if (typeof options.onClick === 'function') {
            container.onclick = function() {
                container.onclick = null;                    
                setTimeout(function () {
                    fadeOut(container, 100, options.fadeStep, options.fadeSpeed, options);
                }, options.duration * 1000);
                options.onClick();
            }
        } else {
            setTimeout(function () {
                fadeOut(container, 100, options.fadeStep, options.fadeSpeed, options);
             },
             (+options.duration > 0 ? options.duration : 3) * 1000);

            if (options.onClick !== undefined) {
                console.error('Bad onClick.');
            }  
        }

        container.style.position = 'absolute';

        if(options.xOrientation === 'left') {
            container.style.left = '0px';
        } else if (options.xOrientation === 'right') {
            container.style.right = '0px';
        }
        else {
            return console.error('Bad xOrientation.');
        }

        if (!options.styles['height'] || !options.styles['margin']) {
            return console.error('Height and margin are needed.');
        }

        if(options.yOrientation === 'top') {
            container.style.top = ((+options.styles.height.replace('px', '') * (activeAlerts - 1)) + (+options.styles.margin.replace('px', '') * (activeAlerts - 1))) + "px";
        } else if (options.yOrientation === 'bottom') {
            container.style.bottom = ((+options.styles.height.replace('px', '') * (activeAlerts - 1)) + (+options.styles.margin.replace('px', '') * (activeAlerts - 1))) + "px";
        } else {
            return console.error('Bad yOrientation.');
        }

        for (var propertyName in options.styles) {
            container.style[propertyName] = options.styles[propertyName];
        }

        if (options.text != '') {
            container.appendChild(document.createTextNode(options.text));
        } else {
            return console.error('Bad text.');
        }

        activeAlertsElems.push(container);

        document.body.appendChild(container);
    };
})();
