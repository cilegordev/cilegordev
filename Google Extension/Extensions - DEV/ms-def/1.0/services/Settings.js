"use strict";var Settings=function(){const t="Settings";let e={isOn:!0,isInstanceIDInitialized:!1,instanceID:0};var n=function(t,e){let n=!1;if(e)for(let i in e)e[i]!==t[i]&&(t[i]=e[i],n=!0);return n};return{get:function(i){Storage.getFromLocalStore(t,(function(t){let o=JSON.parse(JSON.stringify(e));n(o,t),i&&i(o)}))},set:function(i,o){Storage.getFromLocalStore(t,(function(r){let s=JSON.parse(JSON.stringify(e));r&&n(s,r),n(s,i),Storage.setToLocalStore(t,s,o)}))}}}();