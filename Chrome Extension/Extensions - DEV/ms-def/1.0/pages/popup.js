"use strict";!function(){chrome.runtime.sendMessage({messageType:Messages.MessageType.POPUP_LAUNCHED});const e=document.getElementById("onoffswitch"),t=document.getElementById("divSwitch"),s=document.getElementById("status"),n=document.getElementById("privacyLink"),o=document.getElementById("uninstallLink"),c=document.getElementById("demoLink"),a=document.getElementById("reportSiteLink");let i=!0;var m=function(t){t?(s.textContent="On",e.classList.add("on"),e.classList.remove("off")):(s.textContent="Off",e.classList.remove("on"),e.classList.add("off"))};e.onclick=function(){i=!i,m(i),Settings.set({isOn:i}),chrome.runtime.sendMessage({messageType:Messages.MessageType.PROTECTION_TOGGLED,toggleState:i})},n.onclick=async()=>{await chrome.runtime.sendMessage({messageType:Messages.MessageType.PRIVACY_CLICKED}),chrome.tabs.create({url:"https://go.microsoft.com/fwlink/?linkid=866554"})},o.onclick=async()=>{await chrome.runtime.sendMessage({messageType:Messages.MessageType.UNINSTALL_CLICKED}),chrome.tabs.create({url:"https://go.microsoft.com/fwlink/?linkid=866555"})},c.onclick=async()=>{await chrome.runtime.sendMessage({messageType:Messages.MessageType.DEMO_CLICKED}),chrome.tabs.create({url:"https://go.microsoft.com/fwlink/?linkid=866556"})},a.onclick=function(){chrome.runtime.sendMessage({messageType:Messages.MessageType.REPORT_SITE_CLICKED}),chrome.tabs.query({active:!0,currentWindow:!0},(e=>{const t=e[0].url;window.open("https://feedback.smartscreen.microsoft.com/feedback.aspx?t=0&url="+t,"_blank")}))},document.getElementById("copyrightYear").textContent=`${(new Date).getFullYear()}`,document.getElementById("versionNumber").textContent=chrome.runtime.getManifest().version,Settings.get((e=>{i=e.isOn,m(i)})),chrome.storage.managed.get(["HideProtectionToggle"]).then((e=>{e.HideProtectionToggle&&(i=!0,Settings.set({isOn:!0}),t.style.display="none")}))}();