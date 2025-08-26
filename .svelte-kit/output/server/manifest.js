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
		client: {start:"_app/immutable/entry/start.BKmzFVu2.js",app:"_app/immutable/entry/app.D3lJENnr.js",imports:["_app/immutable/entry/start.BKmzFVu2.js","_app/immutable/chunks/CdIZ-4Ob.js","_app/immutable/chunks/DTZc6t40.js","_app/immutable/chunks/C2HaNSK4.js","_app/immutable/chunks/Bsa8e9aV.js","_app/immutable/entry/app.D3lJENnr.js","_app/immutable/chunks/C2HaNSK4.js","_app/immutable/chunks/DTZc6t40.js","_app/immutable/chunks/Bsa8e9aV.js","_app/immutable/chunks/DsnmJJEf.js","_app/immutable/chunks/DogvFaiY.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
