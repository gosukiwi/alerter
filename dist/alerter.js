"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
; // All of alerter lives inside this anonymous function:

(function () {
  // ===========================================================================
  // HELPER FUNCTIONS
  // ===========================================================================
  function setOpacity(element, value) {
    element.style.opacity = value / 100;
    element.style.filter = "alpha(opacity=".concat(value, ")");
  }

  function fadeOut(element, opacity, fadeStep, fadeSpeed, done) {
    if (opacity - fadeStep >= 0) {
      setOpacity(element, opacity - fadeStep);
      setTimeout(function () {
        fadeOut(element, opacity - fadeStep, fadeStep, fadeSpeed, done);
      }, fadeSpeed);
    } else {
      done();
    }
  }

  function extend(a, b) {
    var output = {};
    Object.keys(a).forEach(function (key) {
      output[key] = a[key];
    });
    Object.keys(b).forEach(function (key) {
      output[key] = b[key];
    });
    return output;
  } // ===========================================================================
  // CLASSES AND GLOBALS
  // ===========================================================================


  var PositionList =
  /*#__PURE__*/
  function () {
    function PositionList(positions) {
      _classCallCheck(this, PositionList);

      this.positions = positions || [];
    }

    _createClass(PositionList, [{
      key: "without",
      value: function without(rejected) {
        var result = this.positions.filter(function (position) {
          return position !== rejected;
        });
        return new PositionList(result);
      }
    }, {
      key: "push",
      value: function push(position) {
        return this.positions.push(position);
      }
    }, {
      key: "remove",
      value: function remove(position) {
        var index = this.positions.indexOf(position);
        this.positions.splice(index, 1);
        this.moveDownFrom(position);
      } // Returns all alert positions with the same orientation as this one.
      //

    }, {
      key: "findByOrientation",
      value: function findByOrientation(orientation) {
        var result = this.positions.filter(function (position) {
          return position.orientation.equals(orientation);
        });
        return new PositionList(result);
      }
    }, {
      key: "each",
      value: function each(callback) {
        this.positions.forEach(callback);
      } // Move down all positions over this one, with the same orientation.
      //

    }, {
      key: "moveDownFrom",
      value: function moveDownFrom(position) {
        this.findByOrientation(position.orientation).each(function (other) {
          if (other.isOnTop(position)) {
            other.moveDown();
          }
        });
      } // moves this position to the top of the stack

    }, {
      key: "moveToTop",
      value: function moveToTop(position) {
        var alertAmount = this.without(position).findByOrientation(position.orientation).length;
        var initialVerticalPosition = alertAmount * position.height;
        position.moveTo({
          x: 0,
          y: initialVerticalPosition
        });
      }
    }, {
      key: "length",
      get: function get() {
        return this.positions.length;
      }
    }]);

    return PositionList;
  }();

  var Orientation =
  /*#__PURE__*/
  function () {
    function Orientation(options) {
      _classCallCheck(this, Orientation);

      this.x = options.xOrientation === 'left' ? 'left' : 'right';
      this.y = options.yOrientation === 'top' ? 'top' : 'bottom';
    }

    _createClass(Orientation, [{
      key: "equals",
      value: function equals(other) {
        return this.x === other.x && this.y === other.y;
      }
    }, {
      key: "left",
      value: function left() {
        return this.x === 'left';
      }
    }, {
      key: "right",
      value: function right() {
        return this.x === 'right';
      }
    }, {
      key: "top",
      value: function top() {
        return this.y === 'top';
      }
    }, {
      key: "bottom",
      value: function bottom() {
        return this.y === 'bottom';
      }
    }]);

    return Orientation;
  }();

  var Position =
  /*#__PURE__*/
  function () {
    function Position(element, options) {
      _classCallCheck(this, Position);

      this.element = element;
      this.orientation = new Orientation(options);
    }

    _createClass(Position, [{
      key: "isOnTop",
      // Returns when this position is consirered to be on top of other position.
      // This varies depending on the orientation.
      //
      value: function isOnTop(other) {
        return this.y > other.y;
      } // moves this position down one place in the stack

    }, {
      key: "moveDown",
      value: function moveDown() {
        this.element.style[this.orientation.y] = "".concat(this.y - this.height, "px");
      }
    }, {
      key: "moveTo",
      value: function moveTo(_ref) {
        var x = _ref.x,
            y = _ref.y;
        this.element.style[this.orientation.x] = "".concat(x, "px");
        this.element.style[this.orientation.y] = "".concat(y, "px");
      }
    }, {
      key: "x",
      get: function get() {
        return +this.element.style[this.orientation.x].replace('px', '');
      }
    }, {
      key: "y",
      get: function get() {
        return +this.element.style[this.orientation.y].replace('px', '');
      }
    }, {
      key: "height",
      get: function get() {
        var height = this.element.offsetHeight;
        var margin = parseInt(this.element.style.margin, 10);
        return height + margin;
      }
    }]);

    return Position;
  }();

  var Alert =
  /*#__PURE__*/
  function () {
    function Alert(options, positions) {
      _classCallCheck(this, Alert);

      this.options = options;
      this.element = document.createElement('div');
      this.positions = positions;
      this.position = new Position(this.element, options);
      this.build();
      this.setUpAutohide();
      this.bindEvents();
    }

    _createClass(Alert, [{
      key: "build",
      value: function build() {
        var _this = this;

        var useDefaultStyles = true;

        if (this.options.id && typeof this.options.id === 'string') {
          this.element.id = this.options.id;
          useDefaultStyles = false;
        }

        if (this.options.class && typeof this.options.class === 'string') {
          this.element.className = this.options.class;
          useDefaultStyles = false;
        }

        if (useDefaultStyles) {
          Object.keys(this.options.styles).forEach(function (styleName) {
            _this.element.style[styleName] = _this.options.styles[styleName];
          });
        }

        this.element.appendChild(document.createTextNode(this.options.text || ''));
        this.element.style.position = 'absolute'; // We add the element to the DOM in a hidden position to use the browser to
        // calculate it's size dynamically.

        this.element.style[this.position.orientation.x] = '-9990px';
        this.element.style[this.position.orientation.y] = '-9990px';
        this.positions.push(this.position);
        this.addToDOM(); // the element needs to be added to the DOM before `moveToTop` is called

        this.positions.moveToTop(this.position);
      }
    }, {
      key: "setUpAutohide",
      value: function setUpAutohide() {
        var _this2 = this;

        if (!this.options.autohide) {
          return;
        }

        var waitUntilHide = (+this.options.duration > 0 ? this.options.duration : 3) * 1000;
        setTimeout(function () {
          _this2.fade();
        }, waitUntilHide);
      }
    }, {
      key: "bindEvents",
      value: function bindEvents() {
        var _this3 = this;

        if (typeof this.options.onClick !== 'function') {
          return;
        }

        this.element.onclick = function () {
          _this3.element.onclick = null;

          _this3.options.onClick(_this3);
        };
      }
    }, {
      key: "fade",
      value: function fade() {
        var _this4 = this;

        fadeOut(this.position.element, 100, this.options.fadeStep, this.options.fadeSpeed, function () {
          _this4.hide();
        });
      }
    }, {
      key: "hide",
      value: function hide() {
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
    }, {
      key: "removeFromDOM",
      value: function removeFromDOM() {
        this.element.parentNode.removeChild(this.element);
      }
    }, {
      key: "addToDOM",
      value: function addToDOM() {
        document.body.appendChild(this.element);
      }
    }, {
      key: "close",
      value: function close() {
        return this.hide();
      }
    }]);

    return Alert;
  }(); // ===========================================================================
  // INITIALIZATION
  // ===========================================================================


  var DEFAULTS = {
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
      minWidth: '250px'
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
    autohide: true
  };
  var positions = new PositionList();

  window.alerter = function (settings) {
    // if the parameter is a string, assume it's the text parameter
    if (typeof settings === 'string') {
      settings = {
        text: settings
      };
    }

    var options = extend(DEFAULTS, settings);
    return new Alert(options, positions);
  };
})();