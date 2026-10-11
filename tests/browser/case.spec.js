const {test,expect}=require("@playwright/test");
test("Spanish detective home, English pivot, unverified banner",async({page})=>{
 await page.goto("/");
 await expect(page.getByRole("heading",{name:/Hay una carta/})).toBeVisible();
 await expect(page.getByText("MATERIAL DEMO · SIN CERTIFICAR")).toBeVisible();
 await expect(page.getByText(/Idioma común: English/)).toBeVisible();
 expect((await page.request.get("/assets/office.svg")).status()).toBe(200);
});
test("case completion and persistent progress after reload",async({page})=>{
 await page.goto("/");
 await page.locator(".hero [data-route=investigation]").click();
 for(const x of ["board","desk","shelf"])await page.locator('[data-clue="'+x+'"]').click();
 await expect(page.getByText("Nota: habitación 12")).toBeVisible();
 const mobile=await page.locator(".mobile-nav").isVisible();
 await page.locator((mobile?".mobile-nav":".rail")+" [data-route=memory]").click();
 for(const p of ["p1","p2","p3","p4"]){
   await page.locator('[data-card="'+p+'-en"]').click();
   await page.locator('[data-card="'+p+'-tr"]').click();
   await expect(page.locator('[data-card="'+p+'-en"].matched')).toBeVisible();
 }
 await page.getByRole("button",{name:/Regresar al caso/}).click();
 await page.getByRole("button",{name:/Resolver expediente/}).click();
 await page.locator('[data-answer="a"]').click();
 await expect(page.getByText("Deducción correcta.")).toBeVisible();
 await page.reload();
 await page.locator(".hero [data-route=investigation]").click();
 await expect(page.getByText("Una contradicción resuelta")).toBeVisible();
});
test("download CSV and keyboard inspect",async({page})=>{
 await page.goto("/");
 await page.locator(".hero [data-route=deck]").click();
 await page.getByRole("button",{name:"Voltear tarjeta"}).click();
 await expect(page.locator(".flashcard.flipped")).toBeVisible();
 const dl=page.waitForEvent("download");
 await page.getByRole("button",{name:"Descargar vocabulario CSV"}).click();
 expect((await dl).suggestedFilename()).toBe("ATLAS_vocabulario_demo.csv");
 const mobile=await page.locator(".mobile-nav").isVisible();
 await page.locator((mobile?".mobile-nav":".rail")+" [data-route=investigation]").click();
 await page.locator('[data-clue=desk]').focus();
 await page.keyboard.press("Enter");
 await expect(page.getByText("Llave marcada 21")).toBeVisible();
});
test("mobile viewport has no horizontal scrolling",async({page})=>{
 test.skip(page.viewportSize().width>500,"mobile only");
 await page.goto("/");
 const dims=await page.evaluate(()=>[innerWidth,document.documentElement.scrollWidth]);
 expect(dims[1]).toBeLessThanOrEqual(dims[0]+1);
 await expect(page.locator(".mobile-nav")).toBeVisible();
});
