import { Toast, environment, showToast } from "@vicinae/api";
import { findScriptByCommandName, runShellScript } from "./scripts";

export default async function RunScriptCommand() {
	const script = findScriptByCommandName(environment.commandName);
	if (!script) {
		await showToast({
			title: "Script not configured",
			message: `Add an entry for '${environment.commandName}' in src/scripts.ts`,
			style: Toast.Style.Failure,
		});
		return;
	}

	await runShellScript(script);
}
