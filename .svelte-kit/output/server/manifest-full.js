export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.D8dx_AZx.js",app:"_app/immutable/entry/app.ClXH2dOS.js",imports:["_app/immutable/entry/start.D8dx_AZx.js","_app/immutable/chunks/CBXBkv8x.js","_app/immutable/chunks/pFRYz6ln.js","_app/immutable/chunks/ChSMbZUk.js","_app/immutable/entry/app.ClXH2dOS.js","_app/immutable/chunks/ChSMbZUk.js","_app/immutable/chunks/pFRYz6ln.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/xle2z31F.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/webcam",
				pattern: /^\/api\/webcam\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/webcam/_server.ts.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
