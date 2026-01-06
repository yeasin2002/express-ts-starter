import os from "os";

export function getLocalIP() {
	const nets = os.networkInterfaces();
	let localIP = null;

	for (const name of Object.keys(nets)) {
		for (const net of nets[name] as any) {
			if (net.family === "IPv4" && !net.internal) {
				localIP = net.address;
			}
		}
	}

	return localIP;
}
