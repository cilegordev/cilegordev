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

//
// Module framework stuff
//

function require(module)
{
  var result = require.scopes[module];
  if (typeof result == "function" && !(module in require.loaded))
  {
    result = require.scopes[module] = result();
    require.loaded[module] = true;
  }
  return result;
}
require.loaded = Object.create(null);
require.scopes = Object.create(null);

function importAll(module, globalObj)
{
  var exports = require(module);
  for (var key in exports)
    globalObj[key] = exports[key];
}

onShutdown = {
  done: false,
  add: function() {},
  remove: function() {}
};

//
// XPCOM emulation
//

var Components =
{
  interfaces:
  {
    nsIFile: {DIRECTORY_TYPE: 0},
    nsIFileURL: function() {},
    nsIHttpChannel: function() {},
    nsITimer: {TYPE_REPEATING_SLACK: 0},
    nsIInterfaceRequestor: null,
    nsIChannelEventSink: null
  },
  classes:
  {
    "@mozilla.org/timer;1":
    {
      createInstance: function()
      {
        return new FakeTimer();
      }
    },
    "@mozilla.org/xmlextras/xmlhttprequest;1":
    {
      createInstance: function()
      {
        return new XMLHttpRequest();
      }
    }
  },
  results: {},
  utils: {
    reportError: function(e)
    {
      console.error(e);
      console.trace();
    }
  },
  manager: null,
  ID: function()
  {
    return null;
  }
};
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

var XPCOMUtils =
{
  generateQI: function() {}
};

//
// Fake nsIFile implementation for our I/O
//

function FakeFile(path)
{
  this.path = path;
}
FakeFile.prototype =
{
  get leafName()
  {
    return this.path;
  },
  set leafName(value)
  {
    this.path = value;
  },
  append: function(path)
  {
    this.path += path;
  },
  clone: function()
  {
    return new FakeFile(this.path);
  },
  get parent()
  {
    return {create: function() {}};
  },
  normalize: function() {}
};

//
// Services.jsm module emulation
//

var Services =
{
  obs: {
    addObserver: function() {},
    removeObserver: function() {}
  },
  vc: {
    compare: function(v1, v2)
    {
      function parsePart(s)
      {
        if (!s)
          return parsePart("0");

        var part = {
          numA: 0,
          strB: "",
          numC: 0,
          extraD: ""
        };

        if (s === "*")
        {
          part.numA = Number.MAX_VALUE;
          return part;
        }

        var matches = s.match(/(\d*)(\D*)(\d*)(.*)/);
        part.numA = parseInt(matches[1], 10) || part.numA;
        part.strB = matches[2] || part.strB;
        part.numC = parseInt(matches[3], 10) || part.numC;
        part.extraD = matches[4] || part.extraD;

        if (part.strB == "+")
        {
          part.numA++;
          part.strB = "pre";
        }

        return part;
      }

      function comparePartElement(s1, s2)
      {
        if (s1 === "" && s2 !== "")
          return 1;
        if (s1 !== "" && s2 === "")
          return -1;
        return s1 === s2 ? 0 : (s1 > s2 ? 1 : -1);
      }

      function compareParts(p1, p2)
      {
        var result = 0;
        var elements = ["numA", "strB", "numC", "extraD"];
        elements.some(function(element)
        {
          result = comparePartElement(p1[element], p2[element]);
          return result;
        });
        return result;
      }

      var parts1 = v1.split(".");
      var parts2 = v2.split(".");
      for (var i = 0; i < Math.max(parts1.length, parts2.length); i++)
      {
        var result = compareParts(parsePart(parts1[i]), parsePart(parts2[i]));
        if (result)
          return result;
      }
      return 0;
    }
  }
}

//
// FileUtils.jsm module emulation
//

var FileUtils =
{
  PERMS_DIRECTORY: 0
};

function FakeTimer()
{
}
FakeTimer.prototype =
{
  delay: 0,
  callback: null,
  initWithCallback: function(callback, delay)
  {
    this.callback = callback;
    this.delay = delay;
    this.scheduleTimeout();
  },
  scheduleTimeout: function()
  {
    var me = this;
    window.setTimeout(function()
    {
      try
      {
        me.callback();
      }
      catch(e)
      {
        Cu.reportError(e);
      }
      me.scheduleTimeout();
    }, this.delay);
  }
};

//
// Add a channel property to XMLHttpRequest, Synchronizer needs it
//

XMLHttpRequest.prototype.channel =
{
  status: -1,
  notificationCallbacks: {},
  loadFlags: 0,
  INHIBIT_CACHING: 0,
  VALIDATE_ALWAYS: 0,
  QueryInterface: function()
  {
    return this;
  }
};
