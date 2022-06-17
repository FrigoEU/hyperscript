var w = typeof window === "undefined" ? require("html-element") : window;
var hammer = typeof window === "undefined" ? null : window.Hammer;

var document = w.document;
var Text = w.Text;

if (hammer) {
  hammer.defaults.preset = [[hammer.Tap]];
}

function h(tagName, attrs) {
  var children = [].slice.call(arguments, 2);

  var e = document.createElement(tagName);
  if (attrs && typeof attrs === "object" && !isNode(attrs)) {
    processAttrs(e, attrs);
  }

  children.forEach((c) => processChild(e, c));

  return e;
}

module.exports = h;

function processAttrs(el, attrs) {
  for (var k in attrs) {
    if ("function" === typeof attrs[k]) {
      if (/^on\w+/.test(k)) {
        if (k === "onclick" && hammer) {
          let ham = new hammer(el);
          ham.on("tap", attrs[k]);
          if (typeof window !== "undefined" && window.scheduleForCleanup) {
            window.scheduleForCleanup(() => ham.destroy());
          }
        } else {
          el.addEventListener(k.substring(2), attrs[k], false);
        }
      }
    } else if (k === "style") {
      if ("string" === typeof attrs[k]) {
        el.style.cssText = attrs[k];
      } else {
        for (var s in attrs[k])
          (function (s, v) {
            if ("function" === typeof v) {
              // observable
              el.style.setProperty(s, v());
            } else var match = attrs[k][s].match(/(.*)\W+!important\W*$/);
            if (match) {
              el.style.setProperty(s, match[1], "important");
            } else {
              el.style.setProperty(s, attrs[k][s]);
            }
          })(s, attrs[k][s]);
      }
    } else if (k === "attrs") {
      for (var v in attrs[k]) {
        el.setAttribute(v, attrs[k][v]);
      }
    } else if (k.substr(0, 5) === "data-") {
      el.setAttribute(k, attrs[k]);
    } else if (
      k === "href" &&
      el.nodeName.toLowerCase() === "a" &&
      hammer !== null
    ) {
      let ham = new hammer(el);
      const link = attrs[k];
      ham.on("tap", (ev) => {
        location.href = link;
        ev.srcEvent.preventDefault();
      });
      if (typeof window !== "undefined" && window.scheduleForCleanup) {
        window.scheduleForCleanup(() => ham.destroy());
      }
    } else {
      el[k] = attrs[k];
    }
  }
}

function processChild(el, l) {
  if (l == null) {
  } else if ("string" === typeof l) {
    el.appendChild(document.createTextNode(l));
  } else if (
    "number" === typeof l ||
    "boolean" === typeof l ||
    l instanceof Date ||
    l instanceof RegExp
  ) {
    el.appendChild(document.createTextNode(l.toString()));
  }
  //there might be a better way to handle this...
  else if (isNode(l)) {
    el.appendChild(l);
  } else if (Array.isArray(l)){
    l.forEach(p => processChild(el, p));
  } else if (l instanceof Text) {
    el.appendChild(l);
  }
}

function isNode(el) {
  return el && el.nodeName && el.nodeType;
}
