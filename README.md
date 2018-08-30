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

# Configuration
The default configuration works most of the times, but of course, you can 
customize as you please

|Name|Mandatory?|Type|Default value|Description|
|:--:|:--------:|:--:|:-----------:|:---------:|
|text|yes|string|'Default Alert Text'|Alert text|
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
|onFadeOut|no|function|none|Called after fadeOut|
|onClick|no|function|none|Called on click event once|

# Installation

    $ npm install alerterjs
    
You can find alerter in `node_modules/alerterjs/alerter.js` as well as `node_modules/alerterjs/alerter.min.js`.

# Development

Install all dependencies with `npm`. To minify `alerter.js` and generate
`alerter.min.js`, run:

    $ bin/minify

