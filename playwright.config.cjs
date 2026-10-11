const {defineConfig}=require("@playwright/test");
module.exports=defineConfig({
 testDir:"./tests/browser",timeout:30000,expect:{timeout:10000},workers:2,retries:0,
 reporter:[["list"],["html",{open:"never",outputFolder:"reports/playwright-html"}]],
 use:{baseURL:"http://127.0.0.1:4173",screenshot:"only-on-failure"},
 projects:[
 {name:"desktop",use:{viewport:{width:1366,height:850},browserName:"chromium"}},
 {name:"mobile",use:{viewport:{width:390,height:844},browserName:"chromium",isMobile:true,hasTouch:true}}
 ],
 webServer:{command:"python -m http.server 4173 --bind 127.0.0.1 --directory dist",url:"http://127.0.0.1:4173",reuseExistingServer:false,timeout:15000}
});
