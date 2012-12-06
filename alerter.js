/* ----------------------------------------------------------------------------
    alerter is a minimal vanilla javascript alert system, it will display a
    message, and then it will fade, it stacks with currently existant alerts.

    TESTED ON:
        IE 7, 8, 9, 10
        Latest Chrome

    Copyright Federico Ramírez <fedra.arg@gmail.com>
    Licenced under the MIT Licence
*/

var alerter;
;(function (undefined) {
    "use strict";

    var defaults = {
            // the height of the alert div
            height: 50,
            // the foreground and background colors for the alert
            backgroundColor: 'A200FF',
            foregroundColor: 'FFFFFF',
            // font settings
            fontFamily: 'Segoe UI',
            fontSize: 13,
            // probably the most interesting property you will change, the
            // text of the div
            text: 'Default Alert Text',
            // default margin, padding and size
            margin: 15,
            padding: 5,
            minWidth: 250,
            // how long before hiding it, in seconds
            duration: 2,
            // these two options are for the fadeOut, and dictate how fast it is
            fadeStep: 5,
            fadeSpeed: 25,
            // show it bottom right or bottom left? 
            orientation: 'right'
        },
        activeAlerts = 0,
        activeAlertsElems = [],
        extend,
        fadeOut,
        setOpacity;

    extend = function(a, b) {
        var item;

        for(item in b) {
            if(b[item] !== undefined) {
                a[item] = b[item];
            }
        }

        return a;
    };

    // opacity helper, sets a value from 0 to 100
    setOpacity = function(elem, value) {
        elem.style.opacity = value/100;
        elem.style.filter = 'alpha(opacity=' + value + ')';
    };

    fadeOut = function(element, opacity, fadeStep, fadeSpeed, margin) {
        var i,
            removeIndex,
            bottom,
            h;

        if(opacity - fadeStep >= 0) {
            setOpacity(element, opacity - fadeStep);
            setTimeout(function() { fadeOut(element, opacity - fadeStep, fadeStep, fadeSpeed, margin); }, fadeSpeed);
        } else {
            for(i = 0; i < activeAlertsElems.length; i++) {
                if(activeAlertsElems[i] === element) {
                    removeIndex = i;
                } else {
                    h = parseInt(element.style.height.replace('px', ''), 10);
                    bottom = parseInt((activeAlertsElems[i].style.bottom).replace('px', ''), 10) - margin;
                    activeAlertsElems[i].style.bottom = (bottom - h) + 'px';
                }
            }

            activeAlertsElems.splice(i, 1);
            element.parentNode.removeChild(element);
            activeAlerts -= 1;
        }
    };

    /* -------------------------------------------------------------------------
        alerter initiation, call once for each alert you'd like.
    */
    alerter = function (conf) {
        var options,
            container;

        // if the parameter is a string, assume it's the text parameter
        if(typeof(conf) === 'string') {
            conf = { 'text' : conf };
        }

        activeAlerts += 1;

        options = extend(defaults, conf);

        container = document.createElement('div');

        if(options.orientation === 'left') {
            container.style.left = '0px';
        } else {
            container.style.right = '0px';
        }

        container.style.position = 'absolute';
        container.style.bottom = ((options.height * (activeAlerts - 1)) + (options.margin * (activeAlerts - 1))) + "px";
        container.style.color = '#' + options.foregroundColor;  
        container.style.backgroundColor = '#' + options.backgroundColor;
        container.style.padding = options.padding + 'px';
        container.style.minWidth = options.minWidth + 'px';
        container.style.height = options.height + 'px';
        container.style.lineHeight = options.height + 'px';
        container.style.textAlign = 'center';
        container.style.fontFamily = options.fontFamily;
        container.style.fontSize = options.fontSize + 'px';
        container.appendChild(document.createTextNode(options.text));

        activeAlertsElems.push(container);

        document.body.appendChild(container);

        setTimeout(function () { fadeOut(container, 100, options.fadeStep, options.fadeSpeed, options.margin); }, options.duration * 1000);
    };
})();