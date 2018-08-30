// ============================================================================
// alerter is a minimal vanilla javascript alert system, it will display a
// message, and then it will fade, it stacks with currently existant alerts.
//
// Copyright Federico Ramírez <fedra.arg@gmail.com>
// Licenced under the MIT Licence
//
// VERSION: 1.1.0
//
// In case some invalid javascript was loaded before
;
// All of alerter lives inside this anonymous function:
(() => {
  // ===========================================================================
  // HELPER FUNCTIONS
  // ===========================================================================
  function setOpacity(element, value) {
    element.style.opacity = value / 100;
    element.style.filter = `alpha(opacity=${value})`;
  }

  function fadeOut(position, opacity, fadeStep, fadeSpeed, done) {
    if (opacity - fadeStep >= 0) {
      setOpacity(position.element, opacity - fadeStep);
      setTimeout(() => {
        fadeOut(position, opacity - fadeStep, fadeStep, fadeSpeed, done);
      }, fadeSpeed);
    } else {
      done();
    }
  }

  // ===========================================================================
  // CLASSES AND GLOBALS
  // ===========================================================================
  class PositionList {
    constructor(positions) {
      this.positions = positions || [];
    }

    get length() {
      return this.positions.length;
    }

    without(rejected) {
      const result = this.positions.filter(position => position !== rejected);
      return new PositionList(result);
    }

    push(position) {
      return this.positions.push(position);
    }

    remove(position) {
      const index = this.positions.indexOf(position);
      return this.positions.splice(index, 1);
    }

    // Returns all alert positions with the same orientation as this one.
    //
    findByOrientation(orientation) {
      const result = this.positions.filter(position => position.orientation.equals(orientation));
      return new PositionList(result);
    }

    each(callback) {
      this.positions.forEach(callback);
    }

    // Move down all positions over this one, with the same orientation.
    //
    moveDownFrom(position) {
      this.findByOrientation(position.orientation).each((other) => {
        if (other.isOnTop(position)) {
          other.moveDown();
        }
      });
    }
  }

  // This is the current global environment
  //
  class Current {
    constructor() {
      this.list = new PositionList();
    }

    get positions() {
      return this.list;
    }
  }
  const current = new Current();
  // Note that it also defines a constant `current` to access it.

  class Orientation {
    constructor(options) {
      this.x = options.xOrientation === 'left' ? 'left' : 'right';
      this.y = options.yOrientation === 'top' ? 'top' : 'bottom';
    }

    equals(other) {
      return this.x === other.x && this.y === other.y;
    }

    left() {
      return this.x === 'left';
    }

    right() {
      return this.x === 'right';
    }

    top() {
      return this.y === 'top';
    }

    bottom() {
      return this.y === 'bottom';
    }
  }

  class Position {
    constructor(element, options) {
      this.element = element;
      this.orientation = new Orientation(options);
    }

    get x() {
      return +this.element.style[this.orientation.x].replace('px', '');
    }

    get y() {
      return +this.element.style[this.orientation.y].replace('px', '');
    }

    remove() {
      current.positions.remove(this);
      current.positions.moveDownFrom(this);
    }

    get height() {
      const height = this.element.offsetHeight;
      const margin = parseInt(this.element.style.margin, 10);
      return height + margin;
    }

    // Returns when this position is consirered to be on top of other position.
    // This varies depending on the orientation.
    //
    isOnTop(other) {
      return this.y > other.y;
    }

    // moves this position to the top of the stack
    moveToTop() {
      const alertAmount = current
        .positions
        .without(this)
        .findByOrientation(this.orientation)
        .length;
      const initialVerticalPosition = alertAmount * this.height;

      this.element.style[this.orientation.x] = '0px';
      this.element.style[this.orientation.y] = `${initialVerticalPosition}px`;
    }

    // moves this position down one place in the stack
    moveDown() {
      this.element.style[this.orientation.y] = `${this.y - this.height}px`;
    }
  }

  function extend(a, b) {
    const output = {};

    Object.keys(a).forEach((key) => {
      output[key] = a[key];
    });

    Object.keys(b).forEach((key) => {
      output[key] = b[key];
    });

    return output;
  }

  class Alert {
    constructor(options) {
      const container = document.createElement('div');
      this.options = options;
      this.element = container;
      this.position = new Position(container, options);

      this.build();
    }

    build() {
      let useDefaultStyles = true;

      if (this.options.id && typeof this.options.id === 'string') {
        this.element.id = this.options.id;
        useDefaultStyles = false;
      }

      if (this.options.class && typeof this.options.class === 'string') {
        this.element.className = this.options.class;
        useDefaultStyles = false;
      }

      if (useDefaultStyles) {
        Object.keys(this.options.styles).forEach((styleName) => {
          this.element.style[styleName] = this.options.styles[styleName];
        });
      }

      this.element.appendChild(document.createTextNode(this.options.text || ''));
      this.element.style.position = 'absolute';
      // We add the element to the DOM in a hidden position to use the browser to
      // calculate it's size dynamically.
      this.element.style[this.position.orientation.x] = '-9990px';
      this.element.style[this.position.orientation.y] = '-9990px';

      current.positions.push(this.position);
      this.addToDOM();
      this.position.moveToTop();

      // Bind callbacks
      if (this.options.autohide) {
        const waitUntilHide = (+this.options.duration > 0 ? this.options.duration : 3) * 1000;
        setTimeout(() => {
          fadeOut(this.position, 100, this.options.fadeStep, this.options.fadeSpeed, () => {
            this.hide();
          });
        }, waitUntilHide);
      }

      if (typeof this.options.onClick === 'function') {
        this.element.onclick = () => {
          this.element.onclick = null;
          this.options.onClick(this);
        };
      }
    }

    hide() {
      if (this.removed) {
        return this;
      }

      this.removed = true;
      this.position.remove();
      this.removeFromDOM();
      return this;
    }

    removeFromDOM() {
      this.element.parentNode.removeChild(this.element);
    }

    addToDOM() {
      document.body.appendChild(this.element);
    }

    close() {
      return this.hide();
    }
  }

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================
  const DEFAULTS = {
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
      minWidth: '250px',
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
    onClick: undefined,
    autohide: true,
  };

  window.alerter = (settings) => {
    // if the parameter is a string, assume it's the text parameter
    if (typeof settings === 'string') {
      settings = { text: settings };
    }
    const options = extend(DEFAULTS, settings);
    return new Alert(options);
  };
})();
