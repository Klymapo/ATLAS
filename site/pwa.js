/* Installation prompts are browser-owned. ATLAS never pretends to install itself. */
(function(){
 "use strict";
 let waitingPrompt=null;
 const installButton=()=>document.querySelector("[data-action='install-pwa']");
 function installed(){
  return window.matchMedia("(display-mode: standalone)").matches||
   window.matchMedia("(display-mode: fullscreen)").matches||
   window.navigator.standalone===true;
 }
 function paint(){
  const b=installButton();
  if(!b)return;
  if(installed()){b.hidden=true;return;}
  b.hidden=false;
  b.textContent=waitingPrompt?"Instalar ATLAS ↗":"Usar como aplicación ↗";
 }
 window.ATLAS_INSTALL={
  isInstalled:installed,
  refresh:paint,
  async request(){
   if(installed())return {status:"already-installed"};
   if(waitingPrompt){
     const prompt=waitingPrompt;waitingPrompt=null;
     prompt.prompt();
     const result=await prompt.userChoice;
     paint();
     return {status:result.outcome};
   }
   return {status:"manual"};
  }
 };
 window.addEventListener("beforeinstallprompt",event=>{
   event.preventDefault();waitingPrompt=event;paint();
 });
 window.addEventListener("appinstalled",()=>{waitingPrompt=null;paint();});
 document.addEventListener("DOMContentLoaded",paint);
 if("serviceWorker" in navigator&&window.isSecureContext){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{scope:"./"})
   .catch(()=>{/* Online mode still works without offline cache */}));
 }
})();
