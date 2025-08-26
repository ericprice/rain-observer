import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/2.GFGhKTdZ.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/pFRYz6ln.js","_app/immutable/chunks/ChSMbZUk.js","_app/immutable/chunks/xle2z31F.js","_app/immutable/chunks/Cu02semw.js"];
export const stylesheets = ["_app/immutable/assets/2.EpN7TevA.css"];
export const fonts = ["_app/immutable/assets/ABCMonumentGrotesk-Regular.Cu2CztWC.woff2","_app/immutable/assets/ABCMonumentGrotesk-Regular.CWv4R6Ku.woff","_app/immutable/assets/ABCMonumentGrotesk-RegularItalic.BUmvec5N.woff2","_app/immutable/assets/ABCMonumentGrotesk-RegularItalic.CM_nKc8P.woff"];
