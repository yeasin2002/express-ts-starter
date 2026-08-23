// src/mongoose-plugins/applyDefaults.ts
/** biome-ignore-all lint/complexity/useArrowFunction: <> */
import type { Schema } from "mongoose";

function setByPath(obj: any, path: string, value: any) {
	const keys = path.split(".");
	let cur = obj;
	for (let i = 0; i < keys.length - 1; i++) {
		const k = keys[i];
		if (cur[k] === undefined || cur[k] === null) cur[k] = {};
		cur = cur[k];
	}
	cur[keys[keys.length - 1]] = value;
}

function getByPath(obj: any, path: string) {
	return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

export default function applyDefaultsPlugin(schema: Schema) {
	// Build a map of schema defaults or type-based sensible defaults
	const defaults: Record<string, any> = {};
	schema.eachPath((pathname, schematype: any) => {
		// skip _id and __v and virtual-only paths
		if (pathname === "_id" || pathname === "__v") return;

		const def = schematype.defaultValue;
		if (def !== undefined) {
			defaults[pathname] = typeof def === "function" ? def() : def;
			return;
		}

		// sensible fallback by type
		const inst = schematype.instance;
		if (inst === "String") defaults[pathname] = "";
		else if (inst === "Number") defaults[pathname] = 0;
		else if (inst === "Boolean") defaults[pathname] = false;
		else if (inst === "Array") defaults[pathname] = [];
		else if (inst === "ObjectID") defaults[pathname] = null;
		else if (inst === "Mixed" || inst === "Object") defaults[pathname] = {};
		else defaults[pathname] = null;
	});

	// When a doc is initialized from the DB, fill missing fields on the document instance
	schema.post("init", function (doc: any) {
		Object.entries(defaults).forEach(([path, val]) => {
			if (getByPath(doc, path) === undefined) {
				setByPath(doc, path, val);
			}
		});
	});

	// Ensure toObject / toJSON output also includes defaults (so API responses are consistent)
	const prevToObject = schema.get("toObject")?.transform;
	schema.set(
		"toObject",
		Object.assign({}, schema.get("toObject"), {
			transform: function (doc: any, ret: any, options: any) {
				Object.entries(defaults).forEach(([path, val]) => {
					if (getByPath(ret, path) === undefined) {
						setByPath(ret, path, val);
					}
				});
				if (typeof prevToObject === "function")
					return prevToObject(doc, ret, options);
				return ret;
			},
		}),
	);

	// Same for toJSON (if you use res.json(doc))
	const prevToJSON = schema.get("toJSON")?.transform;
	schema.set(
		"toJSON",
		Object.assign({}, schema.get("toJSON"), {
			transform: function (doc: any, ret: any, options: any) {
				Object.entries(defaults).forEach(([path, val]) => {
					if (getByPath(ret, path) === undefined) {
						setByPath(ret, path, val);
					}
				});
				if (typeof prevToJSON === "function")
					return prevToJSON(doc, ret, options);
				return ret;
			},
		}),
	);
}
