# About
alerter is a vanilla javascript (meaning it **does not** require jQuery nor any 
other library) "plug-in", which lets you display non-obstrusive stackable 
messages in an easy and ordered way.

[Working example](https://gosukiwi.github.io/alerter/demo.html).

# Usage
Using alerter is easy! ```alerter('Hello, World!');``` will display a box with
the text "Hello, World!", it's that easy.

If you need more options, you can pass a configuration object instead of a 
string ```alerter({'text': 'Hello, World!', 'orientation': 'left'});```

Here are a few more examples:

```javascript
document.getElementById('my-button').onclick = function () {
  alerter({
    text: 'Hello, World!'
    yOrientation: 'top',
    onClick: function (alert)  {
      console.log('On click event was triggered!');
      // here you are given an instance of the alert
      // you can close it manually as such:
      alert.hide();
    }
  });
}                

// You can also get an instance as such:
const alert = alerter(...);
alert.hide(); // hides the alert

// Hiding will immediately hide the alert, if you want to fade it
// programatically, you can do so as such:
alert.fade();
```

## Custom Styles
If you specify a class name or an id in the options, all default styles are
ignored. The following styles will be inlined to the element:

```css
alert {
  position: absolute;
  top: _;
  left: _;
  right: _;
  bottom: _;
}
```

The `top`, `left`, `right`, and `bottom` values will be updated dynamically so
you won't need to touch those.

# Configuration
The default configuration works most of the times, but of course, you can 
customize as you please

|Name|Mandatory?|Type|Default value|Description|
|:--:|:--------:|:--:|:-----------:|:---------:|
|text|yes|string|'Default Alert Text'|Alert text|
|autohide|no|boolean|true|Whether or not the alert will be hidden automatically after the specified duration|
|duration|no|number|3|Number of seconds before fadeOut (if onClick is set, starts when the alert is clicked)|
|fadeStep|no|number|5|Fade out step|
|fadeSpeed|no|number|25|Fade out speed|
|xOrientation|no|string ('left'/'right')|'left'|Alert placement on horizontal axis|
|yOrientation|no|string ('top'/'bottom')|'top'|Alert placement on vertical axis|
|styles|no|object|{height: '50px', margin: '15px'}|Styles object|
|styles.height|no|string|'50px'|Alert div height in px (Mandatory unit)|
|styles.margin|no|string|'15px'|Alert div margin in px (Mandatory unit)|
|styles.backgroundColor|no|string|'#000000'|Background color|
|styles.color|no|string|'#FFFFFF'|Text color|
|styles.fontFamily|no|string|'Segoe UI'|Font family|
|styles.fontSize|no|string|'13px'|Font size|
|styles.padding|no|string|'5px'|Alert div padding|
|styles.minWidth|no|string|'250px'|Alert div min width|
|styles.<css attribute name>|no|||Any style you want to add on the alert div|
|id|no|string|none|Optional id attribute, if passed, __the default styles will not apply__|
|class|no|string|none|Optional class attribute, if passed, __the default styles will not apply__|
|onClose|no|function|none|Called after fade-out effect, before removing the element|
|onClick|no|function|none|Called on click event once|

# Installation

    $ npm install alerterjs
    
You can find alerter in `node_modules/alerterjs/dist/alerter.js` as well as
`node_modules/alerterjs/dist/alerter.min.js`.

# Development

Install all dependencies with `npm`. To compile alerter use

    $ npm run build

That will generate the proper files in `dist/`. If you only want to minify
`dist/alerter.js` and generate `dist/alerter.min.js`, run:

    $ npm run minify

