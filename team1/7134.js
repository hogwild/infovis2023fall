"use strict";(self.webpackChunkassignment_5=self.webpackChunkassignment_5||[]).push([[7134,4720],{4720:(e,t,r)=>{r.r(t),r.d(t,{PlayerBubble:()=>o});var n=r(9526),a=r(8174);function o(e){for(var t=e.width,r=e.height,o=e.players,l=.15*t,c=(0,a.BYU)().range([2,l]).domain([10,140]),i=(0,a.A4v)(o).force("x",(0,a.RUJ)(t/2).strength(.05)).force("y",(0,a.Mrm)(r/2).strength(.05)).force("collide",(0,a.Hh)((function(e){return c(e.Goals)+2}))).stop(),s=0;s<200;++s)i.tick();return n.createElement("g",null,o.map((function(e,t){return n.createElement("circle",{key:t,cx:e.x,cy:e.y,r:c(e.Goals),fill:"#2a5599",stroke:"black",strokeWidth:"2"})})),o.slice(-5).map((function(e,t){return n.createElement("g",{key:t},n.createElement("circle",{cx:e.x,cy:e.y,r:c(e.Goals),fill:"#ADD8E6",stroke:"black",strokeWidth:"2"}),n.createElement("text",{x:e.x,y:e.y,dy:-c(e.Goals),style:{textAnchor:"middle",stroke:"pink",strokeWidth:"0.5em",fill:"#992a2a",fontSize:16,fontFamily:"cursive",paintOrder:"stroke",strokeLinejoin:"round"}},e.Goals))})))}},7134:(e,t,r)=>{r.r(t);var n=r(9526),a=(r(3961),r(8174));function o(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}r(4089),r(2870),r(4625),r(4720);var l,c,i,s,u,f=("https://gist.githubusercontent.com/mhendy25/971de005f98140e41d6e1d50ab24eac5/raw/058a9fa78e96fa2e54368a166f9ea804dc8b3dc5/gistfile1.txt",s=n.useState(null),u=2,l=function(e){if(Array.isArray(e))return e}(s)||function(e,t){var r=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=r){var n,a,o,l,c=[],i=!0,s=!1;try{if(o=(r=r.call(e)).next,0===t){if(Object(r)!==r)return;i=!1}else for(;!(i=(n=o.call(r)).done)&&(c.push(n.value),c.length!==t);i=!0);}catch(e){s=!0,a=e}finally{try{if(!i&&null!=r.return&&(l=r.return(),Object(l)!==l))return}finally{if(s)throw a}}return c}}(s,u)||function(e,t){if(e){if("string"==typeof e)return o(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?o(e,t):void 0}}(s,u)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}(),c=l[0],i=l[1],n.useEffect((function(){(0,a.gyn)("https://gist.githubusercontent.com/mhendy25/971de005f98140e41d6e1d50ab24eac5/raw/058a9fa78e96fa2e54368a166f9ea804dc8b3dc5/gistfile1.txt").then((function(e){console.log("my data",e),e.forEach((function(e){e.Titles=+e.Titles})),i(e)})).catch((function(e){console.log("catched error",e)}))}),[]),c);console.log("inside test",f)}}]);