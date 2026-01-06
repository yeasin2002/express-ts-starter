import chalk from "chalk";
import morgan from "morgan";

// Create a custom token for time
morgan.token("time", () => {
	const now = new Date();
	const hours = now.getHours();
	const minutes = now.getMinutes().toString().padStart(2, "0");
	const suffix = hours >= 12 ? "PM" : "AM";
	const formattedHour = hours % 12 || 12;
	return `${formattedHour}:${minutes}${suffix}`;
});

// Define your custom format
export const morganDevFormat =
	chalk.gray(":time -") +
	" " +
	chalk.cyan(":method") +
	" " +
	chalk.yellow(":url") +
	" " +
	chalk.green(":status") +
	" " +
	chalk.magenta(":response-time ms") +
	" - " +
	chalk.blue(":res[content-length] bytes") +
	" " +
	chalk.gray("(:remote-addr)");
