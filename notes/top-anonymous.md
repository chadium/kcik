# Top Anonymous Function

```
(function(_0x3f7a48, _0x438188) {
    var _0x4b866a = _0x5140
      , _0x47580c = _0x3f7a48();
    while (!![]) {
        try {
            var _0x3442c5 = parseInt(_0x4b866a(0xfc3)) / 0x1 + -parseInt(_0x4b866a(0x107b)) / 0x2 * (parseInt(_0x4b866a(0x59e)) / 0x3) + parseInt(_0x4b866a(0x454)) / 0x4 + -parseInt(_0x4b866a(0x3b0)) / 0x5 + parseInt(_0x4b866a(0x116a)) / 0x6 + parseInt(_0x4b866a(0x173e)) / 0x7 + parseInt(_0x4b866a(0x179f)) / 0x8;
            if (_0x3442c5 === _0x438188)
                break;
            else
                _0x47580c['push'](_0x47580c['shift']());
        } catch (_0x2d9fa7) {
            _0x47580c['push'](_0x47580c['shift']());
        }
    }
}(_0x1633, 0x26dfb),
```

~~This looks like it's mean to mess with the debugger. It seems to be meant to make debugging "encrypted" strings much more difficult.~~ It is reordering the elements in the list. It's picking the first element and putting it in last over and over again until it can do a math operation that equals a specific value. So this is meant so that no static analyzers can simply take the list of elements and replace them everywhere. You need to run this algorithm to put them in the correct order.

The `_0x3f7a48` method returns the whole list of strings. And then it does some nonsensical math in an infinite loop.
The `_0x4b866a` method returns one of the strings by index.


