import * as server from '../entries/pages/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/2.CNiRPOBr.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/BsWfOp2Z.js","_app/immutable/chunks/C2HaNSK4.js","_app/immutable/chunks/DogvFaiY.js","_app/immutable/chunks/DkiFQ19z.js"];
export const stylesheets = [];
export const fonts = [];
