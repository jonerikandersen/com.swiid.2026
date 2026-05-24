Dette er en fork av en gammel Homey-app (com.swiid) som må porteres fra Homey SDK2 til SDK3 så den kjører på Homey Pro 2026. Appen støtter én Z-Wave-enhet: SwiidInter cord switch (ren på/av).
Enhetsfakta: manufacturerId 358, productTypeId 256, productId 256, type SWITCH_BINARY, ingen sikkerhet, capability onoff, driver-id SW-ZCS-1.
Gjør følgende:

Les gjennom app.json (eller .homeycompose/), package.json og drivers/SW-ZCS-1/ og oppsummer hvordan appen er bygd i dag før du endrer noe.
Sett "sdk": 3 og oppdater compatibility til det Homey Pro 2026 krever.
I package.json: fjern homey-meshdriver, legg til nyeste homey-zwavedriver.
I driver-fila: bytt MeshDevice → ZwaveDevice, onMeshInit() → onNodeInit(), og registrer this.registerCapability('onoff', 'SWITCH_BINARY'). Behold håndtering av Switch_All-parameteren hvis den finnes.
Behold zwave-blokken med manufacturerId/productTypeId/productId uendret.
Kjør npm install og homey app validate, og fiks det som feiler.

Ikke kjør homey app install ennå — jeg gjør det manuelt når Homey 2026 er oppe. Vis meg diffen før du committer.
