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
      this.positions.splice(index, 1);
      this.moveDownFrom(position);
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

    // moves this position to the top of the stack
    moveToTop(position) {
      const alertAmount = this
        .without(position)
        .findByOrientation(position.orientation)
        .length;
      const initialVerticalPosition = alertAmount * position.height;

      position.moveTo({ x: 0, y: initialVerticalPosition });
    }
  }

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

    // moves this position down one place in the stack
    moveDown() {
      this.element.style[this.orientation.y] = `${this.y - this.height}px`;
    }

    moveTo({ x, y }) {
      this.element.style[this.orientation.x] = `${x}px`;
      this.element.style[this.orientation.y] = `${y}px`;
    }
  }

  class Alert {
    constructor(options, positions) {
      this.options = options;
      this.element = document.createElement('div');
      this.positions = positions;
      this.position = new Position(this.element, options);

      this.build();
      this.setUpAutohide();
      this.bindEvents();
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

      this.positions.push(this.position);
      this.addToDOM();
      // the element needs to be added to the DOM before `moveToTop` is called
      this.positions.moveToTop(this.position);
    }

    setUpAutohide() {
      if (!this.options.autohide) {
        return;
      }

      const waitUntilHide = (+this.options.duration > 0 ? this.options.duration : 3) * 1000;
      setTimeout(() => {
        this.fade();
      }, waitUntilHide);
    }

    bindEvents() {
      if (typeof this.options.onClick !== 'function') {
        return;
      }

      this.element.onclick = () => {
        this.element.onclick = null;
        this.options.onClick(this);
      };
    }

    fade() {
      fadeOut(this.position, 100, this.options.fadeStep, this.options.fadeSpeed, () => {
        this.hide();
      });
    }

    hide() {
      if (this.removed) {
        return this;
      }

      if (typeof this.options.onClose === 'function') {
        this.options.onClose(this);
      }

      this.removed = true;
      this.positions.remove(this.position);
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
    text: 'Default Alert Text',
    // optional element id
    id: undefined, 
    // optional element class
    class: undefined,
    styles: {
      height: '50px',
      backgroundColor: '#A200FF',
      color: '#FFFFFF',
      fontFamily: 'Segoe UI',
      fontSize: '13px',
      margin: '15px',
      padding: '5px',
      minWidth: '250px',
    },
    duration: 3,
    // these two options are for the fadeOut, and dictate how fast it is
    fadeStep: 5,
    fadeSpeed: 25,
    // show it top right or bottom left? any combination is fine
    xOrientation: 'right',
    yOrientation: 'bottom',
    // when the alert is hidden
    onClose: undefined,
    // when the alert is clicked
    onClick: undefined,
    // whether or not the alert will hide automatically
    autohide: true,
  };

  const positions = new PositionList();
  window.alerter = (settings) => {
    // if the parameter is a string, assume it's the text parameter
    if (typeof settings === 'string') {
      settings = { text: settings };
    }
    const options = extend(DEFAULTS, settings);
    return new Alert(options, positions);
  };
})();
