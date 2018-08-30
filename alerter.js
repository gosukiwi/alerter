/* ----------------------------------------------------------------------------
    alerter is a minimal vanilla javascript alert system, it will display a
    message, and then it will fade, it stacks with currently existant alerts.

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

  let DEFAULTS = {
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
    // show it top right or bottom left? any combination is fine
    xOrientation: 'right',
    yOrientation: 'bottom',
    // when the alert is hidden, you can hook up a callback, the
    // callback is called with the options for the alert as argument
    onFadeOut: undefined,
    onClick: undefined
  };

  class PositionList {
    constructor(positions) {
      this.positions = positions || [];
    }

    get length() {
      return this.positions.length;
    }

    without(rejected) {
      var result = this.positions.filter(position => {
        return position !== rejected;
      });
      return new PositionList(result);
    }

    push(position) {
      return this.positions.push(position);
    }

    remove(position) {
      var index = this.positions.indexOf(position);
      return this.positions.splice(index, 1);
    }

    // Returns all alert positions with the same orientation as this one.
    //
    find_by_orientation(orientation) {
      var result = this.positions.filter(position => {
        return position.orientation.equals(orientation);
      });
      return new PositionList(result);
    }

    each(callback) {
      this.positions.forEach(callback);
    }
  }
  let positions = new PositionList();

  class Orientation {
    constructor(options) {
      this.x = options.xOrientation === 'left' ? 'left' : 'right';
      this.y = options.yOrientation === 'top' ? 'top' : 'bottom';
    }

    equals(other) {
      return this.x == other.x && this.y == other.y;
    }

    left() { 
      return this.x == 'left'
    }

    right() { 
      return this.x == 'right'
    }

    top() {
      return this.y == 'top'
    }

    bottom() { 
      return this.y == 'bottom'
    }
  }

  class Position {
    constructor(element, options) {
      this.element = element;
      this.orientation = new Orientation(options);
    }

    get x() {
      return +this.element.style[this.orientation.x].replace('px', '')
    }

    get y() {
      return +this.element.style[this.orientation.y].replace('px', '')
    }

    get height() {
      var height = this.element.offsetHeight;
      var margin = parseInt(this.element.style.margin, 10);
      return height + margin;
    }

    removeFromDOM() {
      this.element.parentNode.removeChild(this.element);
    }

    // Returns when this position is consirered to be on top of other position.
    // This varies depending on the orientation.
    //
    isOnTop(other) {
      return this.y > other.y;
    }

    // moves this position to the top of the stack
    moveToTop() {
      var amountOfAlerts = positions.without(this).find_by_orientation(this.orientation).length;
      var initialVerticalPosition = amountOfAlerts * this.height;

      this.element.style[this.orientation.x] = '0px';
      this.element.style[this.orientation.y] = `${initialVerticalPosition}px`;
    }

    // moves this position down one place in the stack
    moveDown() {
      this.element.style[this.orientation.y] = `${this.y - this.height}px`
    }
  }

  function extend(a, b) {
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
  }

  // opacity helper, sets a value from 0 to 100
  function setOpacity(elem, value) {
    elem.style.opacity = value/100;
    elem.style.filter = 'alpha(opacity=' + value + ')';
  }

  function fadeOut(position, opacity, fadeStep, fadeSpeed, options) {
    var i = 0,
        element = position.element,
        index;

    if(opacity - fadeStep >= 0) {
      setOpacity(element, opacity - fadeStep);
      setTimeout(function() {
        fadeOut(position, opacity - fadeStep, fadeStep, fadeSpeed, options);
      }, fadeSpeed);
    } else {
      removeAlert(position);

      if (typeof options.onFadeOut === 'function') {
        options.onFadeOut(options);
      }
    }
  }

  function removeAlert(position) {
    positions.remove(position);
    refreshAlerts(position);
    position.removeFromDOM();
  }

  // This is used when removing alerts, we need to move some alerts to make the
  // "stackable" effect.
  //
  function refreshAlerts(position) {
    positions.find_by_orientation(position.orientation).each(other => {
      if (other.isOnTop(position)) {
        other.moveDown();
      }
    });
  }

  function newAlert(options) {
    var container = document.createElement('div');
    var position = new Position(container, options);

    var useDefaultStyles = true;
    if (options.id && typeof options.id === 'string') {
      container.id = options.id;
      useDefaultStyles = false;
    }

    if (options.class && typeof options.class === 'string') {
      container.className = options.class;
      useDefaultStyles = false;
    }

    if (useDefaultStyles) {
      for (var styleName in options.styles) {
        container.style[styleName] = options.styles[styleName];
      }
    }

    container.appendChild(document.createTextNode(options.text || ""));
    container.style.position = 'absolute';
    container.style[position.orientation.x] = '-9990px';
    container.style[position.orientation.y] = '-9990px';

    positions.push(position);
    // We add the element to the DOM in a hidden position to use the browser to
    // calculate it's size dynamically.
    document.body.appendChild(container);
    position.moveToTop();

    //if (typeof options.onClick === 'function') {
    //    container.onclick = function() {
    //        container.onclick = null;                    
    //        setTimeout(function () {
    //            fadeOut(container, 100, options.fadeStep, options.fadeSpeed, options);
    //        }, options.duration * 1000);
    //        options.onClick();
    //    }
    //} else {
    var millisWaitedUntilFadeOut = (+options.duration > 0 ? options.duration : 3) * 1000
    setTimeout(function () {
      fadeOut(position, 100, options.fadeStep, options.fadeSpeed, options);
    }, millisWaitedUntilFadeOut);
    //}
  }

  /* -------------------------------------------------------------------------
     alerter initiation, call once for each alert you'd like.
  */
  window.alerter = function (settings) {
    // if the parameter is a string, assume it's the text parameter
    if(typeof(settings) === 'string') {
      settings = { 'text' : settings };
    }
    var options = extend(DEFAULTS, settings);
    newAlert(options);
  };
})();
