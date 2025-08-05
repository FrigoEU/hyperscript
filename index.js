var w = typeof window === "undefined" ? require("html-element") : window;

var document = w.document;
var Text = w.Text;
var clientside = typeof window !== "undefined"

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
        el.addEventListener(k.substring(2), attrs[k], false);
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
    } else if (
      k === "href" &&
      el.nodeName.toLowerCase() === "a"
      && (attrs[k] === null || attrs[k] === undefined)){
      // skip
    } else if (
      k === "href" &&
      el.nodeName.toLowerCase() === "a" &&
      clientside // only clientside
    ) {
      const link = attrs[k];
      if (link && link[0] === "#"){
        el.addEventListener("click", (ev) => {
          location.hash = link;
          ev.preventDefault();
        });
      } else {
        el[k] = attrs[k]; 
      }
    } else {
      if (clientside){
        // clientside: setting properties works the best: fastest, synchronizes with attributes, handles false, nulls, undefined's, etc...
        el[k] = attrs[k]; 
      } else {
        // Serverside: just use setAttribute for everything, since html-element is really inconsistent otherwise
        // mainly it doesn't update the attributes, so cloning a node becomes almost impossible
        // className is not a real property -> have to change that to class
        el.setAttribute(k === "className" ? "class" : k, attrs[k]);
      }
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
