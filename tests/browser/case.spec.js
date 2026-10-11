const fs=require("node:fs");
const {test,expect}=require("@playwright/test");
const nav=async(page,to)=>{
 const mobile=await page.locator(".mobile-nav").isVisible();
 await page.locator((mobile?".mobile-nav":".rail")+' [data-route="'+to+'"]').click();
};
async function onboard(page){
 await page.locator('.hero [data-route="intro"]').click();
 await expect(page.getByRole("heading",{name:"¿Dónde estamos?"})).toBeVisible();
 await expect(page.getByText(/Soy Nora Vale, la archivista/)).toBeVisible();
 for(let i=0;i<3;i++)await page.locator('[data-action="intro-next"]').click();
 for(let i=0;i<4;i++){
   await expect(page.getByText("FICHA "+(i+1)+" DE 4 · VOCABULARIO INICIAL")).toBeVisible();
   await expect(page.locator(".translation-row")).toHaveCount(4);
   await page.locator('[data-action="lesson-next"]').click();
 }
 await expect(page.getByRole("heading",{name:"La llave equivocada"})).toBeVisible();
}
test("Nora and the setting are introduced before memory",async({page},testInfo)=>{
 await page.goto("/");
 await expect(page.getByRole("heading",{name:/Hay una carta/})).toBeVisible();
 await expect(page.getByText(/Sede central · Archivo Internacional/)).toBeVisible();
 await expect(page.getByText("MATERIAL DEMO · SIN CERTIFICAR")).toBeVisible();
 const cta=await page.locator(".hero .button:not(.outline)").first().evaluate(e=>getComputedStyle(e).backgroundColor);
 expect(cta).toBe("rgb(185, 149, 88)");
 await nav(page,"memory");
 await expect(page.getByRole("heading",{name:"¿Dónde estamos?"})).toBeVisible();
 fs.mkdirSync("reports/screenshots",{recursive:true});
 await page.screenshot({path:"reports/screenshots/nora-intro-"+testInfo.project.name+".png",fullPage:true});
});
test("learn four words with nearby playback before assessment",async({page},testInfo)=>{
 await page.goto("/");
 await page.locator('.hero [data-route="intro"]').click();
 for(let i=0;i<3;i++)await page.locator('[data-action="intro-next"]').click();
 await expect(page.getByRole("heading",{name:"Antes de investigar, aprende las pistas"})).toBeVisible();
 await expect(page.locator(".translation-row")).toHaveCount(4);
 const row=page.locator(".translation-row").first();
 await expect(row.locator(".translation-word")).toHaveText("clé");
 await expect(row.locator(".audio-inline")).toBeVisible();
 const distance=await row.evaluate(el=>{
   const word=el.querySelector(".translation-word").getBoundingClientRect();
   const sound=el.querySelector(".audio-inline").getBoundingClientRect();
   return Math.max(0,sound.left-word.right);
 });
 expect(distance).toBeLessThan(350);
 fs.mkdirSync("reports/screenshots",{recursive:true});
 await page.screenshot({path:"reports/screenshots/word-lesson-"+testInfo.project.name+".png",fullPage:true});
 for(let i=0;i<4;i++)await page.locator('[data-action="lesson-next"]').click();
 await nav(page,"memory");
 await expect(page.getByRole("heading",{name:"Parejas de memoria"})).toBeVisible();
 await expect(page.getByText(/Ya viste las cuatro palabras con Nora/)).toBeVisible();
});
test("inspect visual evidence, solve case and keep progress after reload",async({page},testInfo)=>{
 await page.goto("/");
 await onboard(page);
 await page.locator('[data-clue="shelf"]').click();
 await expect(page.locator(".exhibit-mark")).toHaveText("ROOM 12");
 await expect(page.locator(".exhibit-title")).toHaveText("Hoja entre páginas");
 fs.mkdirSync("reports/screenshots",{recursive:true});
 await page.screenshot({path:"reports/screenshots/real-evidence-"+testInfo.project.name+".png",fullPage:true});
 for(const id of ["board","desk"])await page.locator('[data-clue="'+id+'"]').click();
 await expect(page.locator(".exhibit-mark")).toHaveText("21");
 await nav(page,"memory");
 for(const id of ["p1","p2","p3","p4"]){
   await page.locator('[data-card="'+id+'-en"]').click();
   await page.locator('[data-card="'+id+'-tr"]').click();
   await expect(page.locator('[data-card="'+id+'-en"].matched')).toBeVisible();
 }
 await page.getByRole("button",{name:/Regresar al caso/}).click();
 await page.getByRole("button",{name:/Resolver expediente/}).click();
 await page.locator('[data-answer="a"]').click();
 await expect(page.getByText("Deducción correcta.")).toBeVisible();
 await page.reload();
 await nav(page,"investigation");
 await expect(page.getByText("Una contradicción resuelta")).toBeVisible();
});
test("audio controls stay beside words on flashcards; CSV still downloads",async({page})=>{
 await page.goto("/");
 await nav(page,"deck");
 await page.getByRole("button",{name:"Voltear tarjeta"}).click();
 await expect(page.locator(".flashcard .word-with-audio")).toBeVisible();
 await expect(page.locator(".flashcard .audio-inline")).toHaveCount(1);
 await expect(page.locator(".grid-2 .audio-inline")).toHaveCount(4);
 const dl=page.waitForEvent("download");
 await page.getByRole("button",{name:"Descargar vocabulario CSV"}).click();
 expect((await dl).suggestedFilename()).toBe("ATLAS_vocabulario_demo.csv");
});
test("mobile avoids horizontal overflow",async({page})=>{
 test.skip(page.viewportSize().width>500,"mobile only");
 await page.goto("/");
 const dims=await page.evaluate(()=>[innerWidth,document.documentElement.scrollWidth]);
 expect(dims[1]).toBeLessThanOrEqual(dims[0]+1);
 await expect(page.locator(".mobile-nav")).toBeVisible();
});

test("written recall is taught before testing and German requires an article",async({page},testInfo)=>{
  await page.goto("/");
  await nav(page,"practice");
  await expect(page.getByRole("heading",{name:"¿Dónde estamos?"})).toBeVisible();
  for(let i=0;i<3;i++)await page.locator('[data-action="intro-next"]').click();
  for(let i=0;i<4;i++)await page.locator('[data-action="lesson-next"]').click();
  await nav(page,"practice");
  await expect(page.getByRole("heading",{name:"Práctica de recuperación"})).toBeVisible();
  await page.locator('[data-practice-lang="de"]').click();
  await page.locator('[data-action="practice-next"]').click();
  await expect(page.locator(".practice-question")).toHaveText("book");
  await page.locator("#practice-answer").fill("Buch");
  await page.locator("#practice-form button[type=submit]").click();
  await expect(page.getByText("El sustantivo está bien. Falta el artículo correcto.")).toBeVisible();
  await page.locator("#practice-answer").fill("das Buch");
  await page.locator("#practice-form button[type=submit]").click();
  await expect(page.getByText("¡Correcto en este intento!")).toBeVisible();
  await expect(page.getByText(/no certificación de dominio/)).toBeVisible();
  fs.mkdirSync("reports/screenshots",{recursive:true});
  await page.screenshot({path:"reports/screenshots/written-recall-"+testInfo.project.name+".png",fullPage:true});
  await page.reload();
  await nav(page,"practice");
  await page.locator('[data-practice-lang="de"]').click();
  await expect(page.getByText("2 respuestas registradas")).toBeVisible();
  await expect(page.getByText("0 logros lingüísticos certificados")).toBeVisible();
});
test("hinted answers are not counted as independent recovery",async({page})=>{
  await page.goto("/");
  await nav(page,"practice");
  for(let i=0;i<3;i++)await page.locator('[data-action="intro-next"]').click();
  for(let i=0;i<4;i++)await page.locator('[data-action="lesson-next"]').click();
  await nav(page,"practice");
  await page.locator('[data-action="practice-hint"]').click();
  await page.locator("#practice-answer").fill("la clé");
  await page.locator("#practice-form button[type=submit]").click();
  await expect(page.getByText("1 prácticas con pistas")).toBeVisible();
  await expect(page.getByText("0 aciertos sin ayuda")).toBeVisible();
});

test("a saved GitHub Pages progress JSON can be imported on another origin without a server",async({page})=>{
  await page.goto("/");
  await nav(page,"progress");
  const archive={schema_version:1,date:"2026-10-11T00:00:00.000Z",status:"LOCAL_DEMO_PROGRESS",
    data:{visited:["shelf","board","desk"],matched:["p1","p2","p3","p4"],
    turns:4,attempts:1,solved:true,lessonCompleted:true,introSeen:true,sound:false,lessonViewed:["key","book","letter","map"],
    practiceAttempts:[]}};
  page.on("dialog",dialog=>dialog.accept());
  await page.locator("#import-progress-file").setInputFiles({
    name:"ATLAS_progreso_demo.json",mimeType:"application/json",
    buffer:Buffer.from(JSON.stringify(archive))
  });
  await expect(page.getByRole("heading",{name:"Caso cerrado. Archivo abierto."})).toBeVisible();
  await page.reload();
  await nav(page,"progress");
  await expect(page.getByRole("heading",{name:"Caso cerrado. Archivo abierto."})).toBeVisible();
});
test("invalid progress JSON is rejected without overwriting game state",async({page})=>{
  await page.goto("/");
  await nav(page,"progress");
  await page.locator("#import-progress-file").setInputFiles({
    name:"invalid.json",mimeType:"application/json",buffer:Buffer.from('{"schema_version":1,"data":{"visited":"hacked"}}')
  });
  await expect(page.locator("#toast")).toContainText("No se pudo importar");
  await expect(page.getByText("Todavía hay una contradicción por resolver")).toBeVisible();
});


test("PWA is installable from app manifest with real PNG icons and service worker",async({page,request})=>{
 await page.goto("/");
 const manifestResponse=await request.get("/manifest.webmanifest");
 expect(manifestResponse.ok()).toBeTruthy();
 const manifest=await manifestResponse.json();
 expect(manifest.display).toBe("standalone");
 expect(manifest.start_url).toBe("./");
 expect(manifest.icons.some(i=>i.sizes==="192x192")).toBeTruthy();
 expect(manifest.icons.some(i=>i.sizes==="512x512")).toBeTruthy();
 for(const icon of ["icon-192.png","icon-512.png"]){
   const response=await request.get("/"+icon);
   expect(response.status()).toBe(200);
   expect(response.headers()["content-type"]).toContain("image/png");
 }
 await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href","./manifest.webmanifest");
 await page.waitForFunction(()=>"serviceWorker" in navigator);
 await page.waitForFunction(async()=>Boolean((await navigator.serviceWorker.getRegistration())?.active),null,{timeout:20000});
});
test("new HUB has story, daily learning actions and separate language progress without horizontal overflow",async({page},testInfo)=>{
 await page.goto("/");
 await expect(page.locator(".hub-hero")).toBeVisible();
 await expect(page.getByRole("heading",{name:/Hay una carta/})).toBeVisible();
 await expect(page.locator(".hub-mission")).toHaveCount(3);
 await expect(page.locator(".hub-lang-card")).toHaveCount(4);
 await expect(page.locator('.hub-hero [data-route="story"]')).toBeVisible();
 const widths=await page.evaluate(()=>[innerWidth,document.documentElement.scrollWidth]);
 expect(widths[1]).toBeLessThanOrEqual(widths[0]+1);
 fs.mkdirSync("reports/screenshots",{recursive:true});
 await page.screenshot({path:"reports/screenshots/hub-redesign-"+testInfo.project.name+".png",fullPage:true});
});
test("Block 1 is playable, branches persist and language lesson gates the final clue",async({page},testInfo)=>{
 await page.goto("/");
 await nav(page,"story");
 await expect(page.getByRole("heading",{name:"El día en que todavía no había ocurrido"})).toBeVisible();
 await page.locator('[data-story-inspect="fecha"]').click();
 await page.locator('[data-story-inspect="matasellos"]').click();
 await expect(page.getByText("12 DE OCTUBRE")).toBeVisible();
 await expect(page.getByText("11 DE OCTUBRE")).toBeVisible();
 await page.locator('[data-story-observation="fecha"]').click();
 await page.locator('[data-action="story-next"]').click();
 await page.locator('[data-story-inspect="placa"]').click();
 await page.locator('[data-story-inspect="plano"]').click();
 await page.locator('[data-action="story-next"]').click();
 await expect(page.getByRole("heading",{name:"La archivista que no envió la carta"})).toBeVisible();
 await page.locator('[data-story-question="quien"]').click();
 await page.locator('[data-story-question="porqué"]').click();
 await page.locator('[data-action="story-next"]').click();
 await page.locator('[data-story-method="descifrador"]').click();
 await page.locator("#story-alias").fill("Viajero");
 await page.locator('[data-action="story-next"]').click();
 await expect(page.getByRole("heading",{name:"El registro de la correspondencia"})).toBeVisible();
 await expect(page.getByRole("button",{name:/Estudiar las cuatro palabras|Conocer a Nora y estudiar/})).toBeVisible();
 await expect(page.locator('[data-action="story-next"]')).toBeDisabled();
 await page.locator('[data-route="intro"]').last().click();
 for(let i=0;i<3;i++)await page.locator('[data-action="intro-next"]').click();
 for(let i=0;i<4;i++)await page.locator('[data-action="lesson-next"]').click();
 await nav(page,"story");
 await page.locator('[data-story-answer="libro"]').click();
 await expect(page.locator('[data-action="story-next"]')).toBeDisabled();
 await nav(page,"practice");
 await page.locator("#practice-answer").fill("la clé");
 await page.locator('#practice-form button[type="submit"]').click();
 await expect(page.getByText("¡Correcto en este intento!")).toBeVisible();
 await nav(page,"story");
 await expect(page.getByText(/Has completado una práctica escrita correcta sin pistas/)).toBeVisible();
 await page.locator('[data-action="story-next"]').click();
 await expect(page.getByRole("heading",{name:"Los números que no encajan"})).toBeVisible();
 fs.mkdirSync("reports/screenshots",{recursive:true});
 await page.screenshot({path:"reports/screenshots/block1-finale-"+testInfo.project.name+".png",fullPage:true});
 await page.reload();
 await nav(page,"story");
 await expect(page.getByRole("heading",{name:"Los números que no encajan"})).toBeVisible();
 await nav(page,"office");
 await expect(page.getByText("VIAJERO")).toBeVisible();
});
