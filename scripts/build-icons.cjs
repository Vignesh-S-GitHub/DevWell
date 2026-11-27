/* Generate reproducible PWA icons from the original SVG master. */
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{
 const root=path.resolve(__dirname,'..');
 const master=await fs.readFile(path.join(root,'assets/icon.svg'),'utf8');
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({deviceScaleFactor:1});
  for(const size of [192,512]){
   await page.setViewportSize({width:size,height:size});
   await page.setContent('<style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;background:transparent}svg{display:block;width:100%;height:100%}</style>'+master);
   await page.screenshot({path:path.join(root,'assets','icon-'+size+'.png'),omitBackground:true});
  }
 }finally{await browser.close()}
 console.log('Generated 192px and 512px DevWell Pulse installation icons from SVG.');
})().catch(error=>{console.error(error);process.exit(1)});
