# About
alerter is a vanilla javascript (meaning it **does not** require jQuery nor any 
other library) "plug-in", which lets you display non-obstrusive stackable 
messages in an easy and ordered way.

[Working example](http://codepen.io/pen/).

# Usage
Using alerter is easy! ```alerter('Hello, World!');``` will display a box with
the text "Hello, World!", it's that easy.

If you need more options, you can pass a configuration object instead of a 
string ```alerter({'text': 'Hello, World!', 'orientation': 'left'});```

# Configuration
The default configuration works most of the times, but of course, you can 
customize as you please

```
{
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
    orientation: 'right',
    // when the alert is hidden, you can hook up a callback, the
    // callback is called with the options for the alert as argument
    callback: undefined
}
```
