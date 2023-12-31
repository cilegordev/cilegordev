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

var backgroundPage = ext.backgroundPage.getWindow();
var require = backgroundPage.require;

var Utils = require("utils").Utils;
var Notification = require("notification").Notification;
var notificationHelper = require("notificationHelper");
var getActiveNotification = notificationHelper.getActiveNotification;
var shouldDisplayNotification = notificationHelper.shouldDisplay;

function getDocLinks(notification)
{
  if (!notification.links)
    return [];

  var docLinks = [];
  notification.links.forEach(function(link)
  {
    docLinks.push(Utils.getDocLink(link));
  });
  return docLinks;
}

function insertMessage(element, text, links)
{
  var match = /^(.*?)<(a|strong)>(.*?)<\/\2>(.*)$/.exec(text);
  if (!match)
  {
    element.appendChild(document.createTextNode(text));
    return;
  }

  var before = match[1];
  var tagName = match[2];
  var value = match[3];
  var after = match[4];

  insertMessage(element, before, links);

  var newElement = document.createElement(tagName);
  if (tagName === "a" && links && links.length)
    newElement.href = links.shift();
  insertMessage(newElement, value, links);
  element.appendChild(newElement);

  insertMessage(element, after, links);
}

window.addEventListener("load", function()
{
  var notification = getActiveNotification();
  if (!notification || !shouldDisplayNotification("popup", notification.type))
    return;

  var texts = Notification.getLocalizedTexts(notification);
  var titleElement = document.getElementById("notification-title");
  titleElement.textContent = texts.title;

  var docLinks = getDocLinks(notification);
  var messageElement = document.getElementById("notification-message");
  insertMessage(messageElement, texts.message, docLinks);

  messageElement.addEventListener("click", function(event)
  {
    var link = event.target;
    while (link && link !== messageElement && link.localName !== "a")
      link = link.parentNode;
    if (!link)
      return;
    event.preventDefault();
    event.stopPropagation();
    ext.pages.open(link.href);
  });

  var notificationElement = document.getElementById("notification");
  notificationElement.className = notification.type;
  notificationElement.hidden = false;
  notificationElement.addEventListener("click", function(event)
  {
    switch (event.target.id)
    {
      case "notification-close":
        notificationElement.classList.add("closing");
        break;
      case "notification-optout":
        Notification.toggleIgnoreCategory("*", true);
      case "notification-hide":
        notificationElement.hidden = true;
        notification.onClicked();
        break;
    }
  }, true);
}, false);
