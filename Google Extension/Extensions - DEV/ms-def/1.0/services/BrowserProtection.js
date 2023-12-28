"use strict";var BrowserProtection=function(){let e=[],t=new Map;chrome.storage.session.get(["allowedCache"],(e=>{e.allowedCache?(t=new Map(Object.entries(e.allowedCache)),console.log(`The restored session cacheList contained ${t.size} entries.`)):console.log("The session cacheList was empty when the ServiceWorker awoke.")}));var r=function(e,t=5e3){let r;return(...o)=>{r||(r=setTimeout((()=>{r=null,e.apply(this,o)}),t))}}((()=>{chrome.storage.session.set({allowedCache:Object.fromEntries(t)})}));return{checkIfUriIsMalicious:function(e,o){if(!e||!o)return;const s=(new Date).getTime(),n=new URL(e);!function(e){try{let r=UrlHelpers.normalizeHostname(e.hostname+e.pathname);return r.endsWith("/")&&(r=r.slice(0,-1)),t.has(r)?t.get(r)>Date.now()||(t.delete(r),!1):TopSites.isTopSite(e.hostname.toLowerCase())}catch(e){return console.error(e),!1}}(n)?Settings.get((function(a){let i;i=navigator.languages?navigator.languages[0]:navigator.userLanguage||navigator.language;const l=JSON.stringify({correlationId:TelemetryManager.generateGuid(),destination:{uri:UrlHelpers.normalizeHostname(n.hostname+n.pathname)},identity:{client:{version:chrome.runtime.getManifest().version.replace(".","")},device:{id:a.instanceID},user:{locale:i}},userAgent:navigator.userAgent}),c=PatentHash.hash(l),u=JSON.stringify({authId:"6D2E7D9C-1334-4FC2-A549-5EC504F0E8F1",hash:c.hash,key:c.key}),h="SmartScreenHash "+btoa(u);fetch("https://bf.smartscreen.microsoft.com/api/browser/Navigate/1",{method:"POST",credentials:"omit",headers:{"Content-Type":"application/json; charset=utf-8",Authorization:h},body:l}).then((e=>e.ok?e.json():Promise.reject(e))).then((a=>{if(a.allow){let n=BrowserProtectionResult.ResultType.ALLOWED;return"Untrusted"===a.responseCategory&&(n=BrowserProtectionResult.ResultType.UNTRUSTED),o(new BrowserProtectionResult(e,n,BrowserProtectionResult.ResultOrigin.ENDPOINT),(new Date).getTime()-s),void(a.actions&&a.actions.length>0&&function(e){try{for(const o of e)if("cache"===o.$type&&!1===o.callServer&&o.key){const e=Date.now()+o.maxAge/1e4,s=UrlHelpers.normalizeHostname(o.key.uri);t.set(s,e),r()}}catch(e){console.error(e)}}(a.actions))}console.log(`SmartScreen returned a '${a.responseCategory}' block for ${n}.`);let i=BrowserProtectionResult.ResultType.MALICIOUS;"Phishing"===a.responseCategory&&(i=BrowserProtectionResult.ResultType.PHISHING),o(new BrowserProtectionResult(e,i,BrowserProtectionResult.ResultOrigin.ENDPOINT,a.reportFeedback),(new Date).getTime()-s)})).catch((()=>{o(new BrowserProtectionResult(e,BrowserProtectionResult.ResultType.ALLOWED,BrowserProtectionResult.ResultOrigin.FAIL),(new Date).getTime()-s)}))})):o(new BrowserProtectionResult(e,BrowserProtectionResult.ResultType.KNOWNSAFE,BrowserProtectionResult.ResultOrigin.TOPSITE),(new Date).getTime()-s)},addUrlToBypassList:t=>{if(!t)return;let r=new URL(t);e.push(r.hostname+r.pathname)},removeUrlFromBypassList:t=>{if(!t)return;let r=new URL(t),o=r.hostname+r.pathname;e=e.filter((e=>e!==o))},isUrlOnBypassList:t=>{if(0===e.length)return!1;if(!t)return!1;let r=new URL(t),o=r.hostname+r.pathname;return e.some((e=>e===o))},clearBypassList:()=>{e=[]}}}();