/*
#* This file is part of Ad-Blocker http://www.ad-blocker.org/,
#* Copyright (C) 2016 PCVARK Software

#* Ad-Blocker is a bifurcation of the Adblock Plus extension for 
#* blocking advertisements on the web. 
#* This subdivision will provide the same features as that of Adblock Plus.

#* AllAds Blocker is distributed in the hope that it will be useful,
#* but WITHOUT ANY WARRANTY; without even the implied warranty of
#* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#* GNU General Public License for more details.
#*
#* You should have received a copy of the GNU General Public License
#* along with AllAds Blocker.  If not, see <http://www.gnu.org/licenses/>.

#*Original source licence as follows:

 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-2016 Eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var SELECTOR_GROUP_SIZE = 200;

var typeMap = {
  "img": "IMAGE",
  "input": "IMAGE",
  "picture": "IMAGE",
  "audio": "MEDIA",
  "video": "MEDIA",
  "frame": "SUBDOCUMENT",
  "iframe": "SUBDOCUMENT",
  "object": "OBJECT",
  "embed": "OBJECT"
};

function getURLsFromObjectElement(element)
{
  var url = element.getAttribute("data");
  if (url)
    return [url];

  for (var i = 0; i < element.children.length; i++)
  {
    var child = element.children[i];
    if (child.localName != "param")
      continue;

    var name = child.getAttribute("name");
    if (name != "movie"  && // Adobe Flash
        name != "source" && // Silverlight
        name != "src"    && // Real Media + Quicktime
        name != "FileName") // Windows Media
      continue;

    var value = child.getAttribute("value");
    if (!value)
      continue;

    return [value];
  }

  return [];
}

function getURLsFromAttributes(element)
{
  var urls = [];

  if (element.src)
    urls.push(element.src);

  if (element.srcset)
  {
    var candidates = element.srcset.split(",");
    for (var i = 0; i < candidates.length; i++)
    {
      var url = candidates[i].trim().replace(/\s+\S+$/, "");
      if (url)
        urls.push(url);
    }
  }

  return urls;
}

function getURLsFromMediaElement(element)
{
  var urls = getURLsFromAttributes(element);

  for (var i = 0; i < element.children.length; i++)
  {
    var child = element.children[i];
    if (child.localName == "source" || child.localName == "track")
      urls.push.apply(urls, getURLsFromAttributes(child));
  }

  if (element.poster)
    urls.push(element.poster);

  return urls;
}

function getURLsFromElement(element)
{
  var urls;
  switch (element.localName)
  {
    case "object":
      urls = getURLsFromObjectElement(element);
      break;

    case "video":
    case "audio":
    case "picture":
      urls = getURLsFromMediaElement(element);
      break;

    default:
      urls = getURLsFromAttributes(element);
      break;
  }

  for (var i = 0; i < urls.length; i++)
  {
    if (/^(?!https?:)[\w-]+:/i.test(urls[i]))
      urls.splice(i--, 1);
  }

  return urls;
}

function checkCollapse(element)
{
  window.collapsing = true;

  var mediatype = typeMap[element.localName];
  if (!mediatype)
    return;

  var urls = getURLsFromElement(element);
  if (urls.length == 0)
    return;

  ext.backgroundPage.sendMessage(
    {
      type: "filters.collapse",
      urls: urls,
      mediatype: mediatype,
      baseURL: document.location.href
    },

    function(collapse)
    {
      function collapseElement()
      {
        if (element.localName == "frame")
          element.style.setProperty("visibility", "hidden", "important");
        else
          element.style.setProperty("display", "none", "important");
      }

      if (collapse && !element._collapsed)
      {
        collapseElement();
        element._collapsed = true;

        if (MutationObserver)
          new MutationObserver(collapseElement).observe(
            element, {
              attributes: true,
              attributeFilter: ["style"]
            }
          );
      }
    }
  );
}

function checkSitekey()
{
  var attr = document.documentElement.getAttribute("data-adblockkey");
  if (attr)
    ext.backgroundPage.sendMessage({type: "filter.addKey", token: attr});
}

function getContentDocument(element)
{
  try
  {
    return element.contentDocument;
  }
  catch (e)
  {
    return null;
  }
}

function ElementHidingTracer(document, selectors)
{
  this.document = document;
  this.selectors = selectors;

  this.changedNodes = [];
  this.timeout = null;

  this.observer = new MutationObserver(this.observe.bind(this));
  this.trace = this.trace.bind(this);

  if (document.readyState == "loading")
    document.addEventListener("DOMContentLoaded", this.trace);
  else
    this.trace();
}
ElementHidingTracer.prototype = {
  checkNodes: function(nodes)
  {
    var matchedSelectors = [];

    // Find all selectors that match any hidden element inside the given nodes.
    for (var i = 0; i < this.selectors.length; i++)
    {
      var selector = this.selectors[i];

      for (var j = 0; j < nodes.length; j++)
      {
        var elements = nodes[j].querySelectorAll(selector);
        var matched = false;

        for (var k = 0; k < elements.length; k++)
        {
          // Only consider selectors that actually have an effect on the
          // computed styles, and aren't overridden by rules with higher
          // priority, or haven't been circumvented in a different way.
          if (getComputedStyle(elements[k]).display == "none")
          {
            matchedSelectors.push(selector);
            matched = true;
            break;
          }
        }

        if (matched)
          break;
      }
    }

    if (matchedSelectors.length > 0)
      ext.backgroundPage.sendMessage({
        type: "devtools.traceElemHide",
        selectors: matchedSelectors
      });
  },

  onTimeout: function()
  {
    this.checkNodes(this.changedNodes);
    this.changedNodes = [];
    this.timeout = null;
  },

  observe: function(mutations)
  {
    // Forget previously changed nodes that are no longer in the DOM.
    for (var i = 0; i < this.changedNodes.length; i++)
    {
      if (!this.document.contains(this.changedNodes[i]))
        this.changedNodes.splice(i--, 1);
    }

    for (var j = 0; j < mutations.length; j++)
    {
      var mutation = mutations[j];
      var node = mutation.target;

      // Ignore mutations of nodes that aren't in the DOM anymore.
      if (!this.document.contains(node))
        continue;

      // Since querySelectorAll() doesn't consider the root itself
      // and since CSS selectors can also match siblings, we have
      // to consider the parent node for attribute mutations.
      if (mutation.type == "attributes")
        node = node.parentNode;

      var addNode = true;
      for (var k = 0; k < this.changedNodes.length; k++)
      {
        var previouslyChangedNode = this.changedNodes[k];

        // If we are already going to check an ancestor of this node,
        // we can ignore this node, since it will be considered anyway
        // when checking one of its ancestors.
        if (previouslyChangedNode.contains(node))
        {
          addNode = false;
          break;
        }

        // If this node is an ancestor of a node that previously changed,
        // we can ignore that node, since it will be considered anyway
        // when checking one of its ancestors.
        if (node.contains(previouslyChangedNode))
          this.changedNodes.splice(k--, 1);
      }

      if (addNode)
        this.changedNodes.push(node);
    }

    // Check only nodes whose descendants have changed, and not more often
    // than once a second. Otherwise large pages with a lot of DOM mutations
    // (like YouTube) freeze when the devtools panel is active.
    if (this.timeout == null)
      this.timeout = setTimeout(this.onTimeout.bind(this), 1000);
  },

  trace: function()
  {
    this.checkNodes([this.document]);

    this.observer.observe(
      this.document,
      {
        childList: true,
        attributes: true,
        subtree: true
      }
    );
  },

  disconnect: function()
  {
    this.document.removeEventListener("DOMContentLoaded", this.trace);
    this.observer.disconnect();
    clearTimeout(this.timeout);
  }
};

function reinjectStyleSheetWhenRemoved(document, style)
{
  if (!MutationObserver)
    return null;

  var parentNode = style.parentNode;
  var observer = new MutationObserver(function()
  {
    if (style.parentNode != parentNode)
      parentNode.appendChild(style);
  });

  observer.observe(parentNode, {childList: true});
  return observer;
}

function protectStyleSheet(document, style)
{
  var id = Math.random().toString(36).substr(2)
  style.id = id;

  var code = [
    "(function()",
    "{",
    '  var style = document.getElementById("' + id + '") ||',
    '              document.documentElement.shadowRoot.getElementById("' + id + '");',
    '  style.removeAttribute("id");'
  ];

  var disableables = ["style", "style.sheet"];
  for (var i = 0; i < disableables.length; i++)
  {
    code.push("  Object.defineProperty(" + disableables[i] + ', "disabled", '
                                         + "{value: false, enumerable: true});");
  }

  var methods = ["deleteRule", "removeRule"];
  for (var j = 0; j < methods.length; j++)
  {
    var method = methods[j];
    if (method in CSSStyleSheet.prototype)
    {
      var origin = "CSSStyleSheet.prototype." + method;
      code.push("  var " + method + " = " + origin + ";",
                "  " + origin + " = function(index)",
                "  {",
                "    if (this != style.sheet)",
                "      " + method + ".call(this, index);",
                "  }");
    }
  }

  code.push("})();");

  var script = document.createElement("script");
  script.async = false;
  script.textContent = code.join("\n");
  document.documentElement.appendChild(script);
  document.documentElement.removeChild(script);
}

function init(document)
{
  var shadow = null;
  var style = null;
  var observer = null;
  var tracer = null;

  function getPropertyFilters(callback)
  {
    ext.backgroundPage.sendMessage({
      type: "filters.get",
      what: "cssproperties"
    }, callback);
  }
  var propertyFilters = new CSSPropertyFilters(window, getPropertyFilters,
                                               addElemHideSelectors);

  // Use Shadow DOM if available to don't mess with web pages that rely on
  // the order of their own <style> tags (#309).
  //
  // However, creating a shadow root breaks running CSS transitions. So we
  // have to create the shadow root before transistions might start (#452).
  //
  // Also, using shadow DOM causes issues on some Google websites,
  // including Google Docs, Gmail and Blogger (#1770, #2602, #2687).
  if ("createShadowRoot" in document.documentElement &&
      !/\.(?:google|blogger)\.com$/.test(document.domain))
  {
    shadow = document.documentElement.createShadowRoot();
    shadow.appendChild(document.createElement("shadow"));
  }

  function addElemHideSelectors(selectors)
  {
    if (selectors.length == 0)
      return;

    if (!style)
    {
      // Create <style> element lazily, only if we add styles. Add it to
      // the shadow DOM if possible. Otherwise fallback to the <head> or
      // <html> element. If we have injected a style element before that
      // has been removed (the sheet property is null), create a new one.
      style = document.createElement("style");
      (shadow || document.head || document.documentElement).appendChild(style);

      // It can happen that the frame already navigated to a different
      // document while we were waiting for the background page to respond.
      // In that case the sheet property will stay null, after addind the
      // <style> element to the shadow DOM.
      if (!style.sheet)
        return;

      observer = reinjectStyleSheetWhenRemoved(document, style);
      protectStyleSheet(document, style);
    }

    // If using shadow DOM, we have to add the ::content pseudo-element
    // before each selector, in order to match elements within the
    // insertion point.
    if (shadow)
    {
      var preparedSelectors = [];
      for (var i = 0; i < selectors.length; i++)
      {
        var subSelectors = splitSelector(selectors[i]);
        for (var j = 0; j < subSelectors.length; j++)
          preparedSelectors.push("::content " + subSelectors[j]);
      }
      selectors = preparedSelectors;
    }

    // Safari only allows 8192 primitive selectors to be injected at once[1], we
    // therefore chunk the inserted selectors into groups of 200 to be safe.
    // (Chrome also has a limit, larger... but we're not certain exactly what it
    //  is! Edge apparently has no such limit.)
    // [1] - https://github.com/WebKit/webkit/blob/1cb2227f6b2a1035f7bdc46e5ab69debb75fc1de/Source/WebCore/css/RuleSet.h#L68
    for (var i = 0; i < selectors.length; i += SELECTOR_GROUP_SIZE)
    {
      var selector = selectors.slice(i, i + SELECTOR_GROUP_SIZE).join(", ");
      style.sheet.addRule(selector, "display: none !important;");
    }
  };

  var updateStylesheet = function()
  {
    var selectors = null;
    var CSSPropertyFiltersLoaded = false;

    var checkLoaded = function()
    {
      if (!selectors || !CSSPropertyFiltersLoaded)
        return;

      if (observer)
        observer.disconnect();
      observer = null;

      if (tracer)
        tracer.disconnect();
      tracer = null;

      if (style && style.parentElement)
        style.parentElement.removeChild(style);
      style = null;

      addElemHideSelectors(selectors.selectors);
      propertyFilters.apply();

      if (selectors.trace)
        tracer = new ElementHidingTracer(document, selectors.selectors);
    };

    ext.backgroundPage.sendMessage({type: "get-selectors"}, function(response)
    {
      selectors = response;
      checkLoaded();
    });

    propertyFilters.load(function()
    {
      CSSPropertyFiltersLoaded = true;
      checkLoaded();
    });
  };

  updateStylesheet();

  document.addEventListener("error", function(event)
  {
    checkCollapse(event.target);
  }, true);

  document.addEventListener("load", function(event)
  {
    var element = event.target;

    if (/^i?frame$/.test(element.localName))
      checkCollapse(element);

    if (/\bChrome\//.test(navigator.userAgent))
    {
      var contentDocument = getContentDocument(element);
      if (contentDocument)
      {
        var contentWindow = contentDocument.defaultView;
        if (contentDocument instanceof contentWindow.HTMLDocument)
        {
          // Prior to Chrome 37, content scripts cannot run in
          // dynamically created frames. Also on Chrome 37-40
          // document_start content scripts (like this one) don't
          // run either in those frames due to https://crbug.com/416907.
          // So we have to apply element hiding from the parent frame.
          if (!("init" in contentWindow))
            init(contentDocument);

          // Moreover, "load" and "error" events aren't dispatched for elements
          // in dynamically created frames due to https://crbug.com/442107.
          // So we also have to apply element collpasing from the parent frame.
          if (!contentWindow.collapsing)
            Array.prototype.forEach.call(
              contentDocument.querySelectorAll(Object.keys(typeMap).join(",")),
              checkCollapse
            );
        }
      }
    }
  }, true);

  return updateStylesheet;
}

if (document instanceof HTMLDocument)
{
  checkSitekey();
  window.updateStylesheet = init(document);
}
