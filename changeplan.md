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

# Swiid SDK3-port — plan

Mål: beholde de to veggmonterte SwiidInter-bryterne (Stålampe + Hyllelampe) ved å porte den døde SDK2-appen til SDK3 og installere din egen versjon på Homey Pro 2026.

## Fakta vi bygger på

| | Verdi |
|---|---|
| App-repo | `glennsp/com.swiid` (GitHub, åpen kildekode) |
| App-ID | `com.swiid` |
| Driver-ID | `SW-ZCS-1` |
| Manufacturer ID | `358` |
| Product Type ID | `256` |
| Product ID | `256` |
| Enhetstype | `GENERIC_TYPE_SWITCH_BINARY` / `SPECIFIC_TYPE_POWER_SWITCH_BINARY` |
| Capability | `onoff` (ren på/av, ikke dimming) |
| Sikkerhet | Ingen (`zw_secure = ⨯`) |
| Enheter | Stålampe (node 16), Hyllelampe (node 18) |

Kjernen i jobben: appen bruker gamle `homey-meshdriver`. SDK3 krever `homey-zwavedriver`. For en binær switch er dette en liten endring.

## Rekkefølge (viktig)

1. **Migrer Homey 2026 først.** Hele resten av flyttingen (sky, Z-Wave, Zigbee-repair) skal være ferdig og verifisert før vi rører Swiid. Swiid-enhetene kommer uansett ikke med, så de venter til slutt.
2. **Rydd de gamle nodene.** På 2019-en (eller via 2026 etter migrering hvis de henger igjen som ghost nodes): fjern node 16 og 18. Stålampe svarer dårlig (100 % Tx-feil) → bruk «remove failed node» hvis vanlig eksludering ikke når fram.
3. **Bygg og installer den portede appen** (stegene under).
4. **Inkluder de to bryterne på nytt** under din egen app.
5. **Koble flows på nytt** for de to lampene (gamle flow-koblinger følger ikke med siden enhetene re-pares fra bunnen).

## Forutsetninger (engangsoppsett)

- Node.js LTS installert (du har dette på `vision` allerede; kan bygges der eller lokalt)
- Homey CLI: `npm install -g homey`
- Innlogget: `homey login`
- Homey 2026 og maskinen du bygger fra på samme nett

## Portens faktiske endringer

Dette er hele substansen i jobben — fire ting:

1. **`app.json` / `.homeycompose`**
   - `"sdk": 3`
   - `"compatibility": ">=12.0.0"` (eller det 2026 krever)
   - Behold `zwave`-blokken med `manufacturerId: 358`, `productTypeId: [256]`, `productId: [256]`

2. **`package.json`**
   - Fjern `homey-meshdriver`
   - Legg til `homey-zwavedriver` (nyeste)

3. **Driver-fila (`drivers/SW-ZCS-1/device.js`)**
   - `MeshDevice` → `ZwaveDevice`
   - `onMeshInit()` → `onNodeInit()`
   - Registrer capability: `this.registerCapability('onoff', 'SWITCH_BINARY')`

4. **Verifiser driver-`compose`/`driver.json`**
   - `class: "light"`, `capabilities: ["onoff"]`
   - `learnmode`-instruksjon (hvordan sette bryteren i inkludering — trykk på knappen bak)

## Bygge- og installeringssteg

```bash
# 1. Klon
git clone https://github.com/glennsp/com.swiid.git
cd com.swiid

# 2. Egne endringer (gjøres i code-steget etterpå)
#    - app.json: sdk 3 + compatibility
#    - package.json: bytt meshdriver -> zwavedriver
#    - drivers/SW-ZCS-1/device.js: ZwaveDevice + onNodeInit + registerCapability

# 3. Installer avhengigheter
npm install

# 4. Valider
homey app validate

# 5. Installer på Homey 2026 (kjører lokalt på din Homey)
homey app install
```

## Verifisering etter installering

- [ ] `homey app validate` gir grønt
- [ ] Appen vises under Settings → Apps på 2026
- [ ] «Legg til enhet» viser Swiid → SwiidInter
- [ ] Stålampe inkludert og svarer på på/av
- [ ] Hyllelampe inkludert og svarer på på/av
- [ ] Flows for begge lampene gjenoppbygd

## Fallback hvis porten kræsjer

- Hvis inkludering feiler: sjekk at noden er ekskludert rent fra det gamle nettet først (ghost node = inkludering nekter)
- Hvis appen ikke validerer: sammenlign device.js mot Athoms offisielle eksempel `athombv/com.fibaro-example` (samme `registerCapability('onoff', 'SWITCH_BINARY')`-mønster)
- Siste utvei: de fungerer fysisk i veggen uansett — du mister bare Homey-styringen, ikke lyset

## Notat

Dette er en privat app (sideloaded via `homey app install`), ikke publisert i storen. Den lever på din Homey så lenge du ikke avinstallerer. Trenger ikke gjennom Athoms sertifisering.
