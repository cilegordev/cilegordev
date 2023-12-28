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

"use strict";

chrome.runtime.sendMessage(
  {
    type: "prefs.get",
    key: "show_devtools_panel"
  },
  function(enabled)
  {
    if (enabled)
      chrome.devtools.panels.create("Ad-Blocker",
                                    "icons/detailed/abp-48.png",
                                    "devtools-panel.html");
  }
);
