# About
alerter is a vanilla javascript (meaning it **does not** require jQuery nor any 
other library) "plug-in", which lets you display non-obstrusive stackable 
messages in an easy and ordered way.

# Usage
Using alerter is easy! ```alerter('Hello, World!');``` will display a box with
the text "Hello, World!", it's that easy.

If you need more options, you can pass a configuration object instead of a 
string ```alerter({'text': 'Hello, World!', 'orientation': 'left'});```

You can also add an onclick function to the alert!   ```
                alerter({
                    'text': 'Click Me!',
                    'onclick': function () { alert('Alert was clicked-ed!'); } 
                });```


# Configuration
The default configuration works most of the times, but of course, you can 
customize as you please

```
    {
            // the height of the alert div
            height: 55,
            // the foreground and background colors for the alert
            backgroundColor: 'FF8800',
            foregroundColor: 'black',
            // the border colors, style, radius and width for the alert
            borderColor: 'FFFFFF',
            borderWidth: 0,
            borderStyle: 'solid',
            borderRadius: 0,
            // font settings
            fontFamily: 'Segoe UI Light, sans-serif',
            fontSize: 18,
            // probably the most interesting property you will change, the
            // text of the div
            text: 'Default Alert Text',
            // default margin, padding and size
            margin: 15,
            padding: 5,
            minWidth: 300,
            // how long before hiding it, in seconds
            duration: 3.5,
            // these two options are for the fadeOut, and dictate how fast it is
            fadeStep: 10,
            fadeSpeed: 45,
            // show it bottom right or bottom left? 
            orientation: 'right',
            // when the alert is hidden, you can hook up a callback, the
            // callback is called with the options for the alert as argument
            callback: undefined,
            //specify a function here to call it when an alert is clicked
            onclick: function () {}
    }
```
