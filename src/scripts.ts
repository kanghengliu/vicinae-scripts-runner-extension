import { Icon, Toast, showToast } from "@vicinae/api";
import type { Image } from "@vicinae/api";
import { exec } from "node:child_process";
import type { ExecException } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export type ScriptDefinition = {
	/**
	 * Unique identifier used by the list UI and for referencing the script internally.
	 */
	id: string;
	/**
	 * Name of the command in package.json. Used to resolve no-view commands.
	 */
	commandName: string;
	/**
	 * Friendly title shown in the list and toast notifications.
	 */
	title: string;
	/**
	 * Shell command to execute. Runs with `shell: true`, so you can include pipes and quotes.
	 */
	commandLine: string;
	/** Optional description displayed in the list detail pane. */
	description?: string;
	/** Extra search keywords for the list UI. */
	keywords?: string[];
	/** Optional icon for the list item. */
	icon?: Image.ImageLike;
	/** Working directory for the script. */
	workingDirectory?: string;
	/** Environment variables merged with the current process env. */
	env?: Record<string, string>;
	/** Optional timeout (milliseconds). */
	timeoutMs?: number;
	/** Hide from the list UI while keeping the top-level command available. */
	hiddenFromList?: boolean;
};

const definitions: ScriptDefinition[] = [
	{
		id: "restart-quickshell",
		commandName: "restart-quickshell",
		title: "Restart Quickshell",
		commandLine: "~/.config/hypr/scripts/quickshell.sh",
		description: "Restarts the Quickshell",
		keywords: ["compositor", "quickshell", "restart"],
	},
	{
		id: "reload-quickshell",
		commandName: "reload-quickshell",
		title: "Reload Quickshell",
		commandLine: "qs -c myshell ipc call shell reloadQs false",
		description: "Reloads the Quickshell",
		keywords: ["compositor", "quickshell", "reload"],
	},
	{
		id: "audio-switcher",
		commandName: "audio-switcher",
		title: "Audio Switcher",
		commandLine: "~/.config/waybar/audio_changer.sh",
		description: "Switches audio output",
		keywords: ["compositor", "audio", "switcher"],
	},
	{
		id: "screenshot",
		commandName: "screenshot",
		title: "Screenshot",
		commandLine: "~/.config/hypr/scripts/hyprshot.sh",
		description: "Take a screenshot",
		keywords: ["compositor", "screenshot"],
	},
	{
		id: "bluetooth-switcher",
		commandName: "bluetooth-switcher",
		title: "Bluetooth Switcher",
		commandLine: "bzmenu -l custom --launcher-command 'vicinae dmenu'",
		description: "Switch bluetooth devices",
		keywords: ["compositor", "bluetooth", "switcher"],
	},
	{
		id: "kde-clipboard",
		commandName: "kde-clipboard",
		title: "Send Clipboard to device",
		commandLine: "~/.config/waybar/kde_connect_clipboard.sh",
		description: "Send clipboard to devices",
		keywords: ["compositor", "kde", "clipboard", "switcher"],
	},
];

const definitionsByCommand = new Map<string, ScriptDefinition>();
for (const definition of definitions) {
	definitionsByCommand.set(definition.commandName, definition);
}

export const scripts = definitions;

export const findScriptByCommandName = (commandName: string) =>
	definitionsByCommand.get(commandName);

export async function runShellScript(definition: ScriptDefinition) {
	const toast = await showToast({
		title: `Running ${definition.title}`,
		style: Toast.Style.Animated,
	});

	try {
		const { stdout, stderr } = await execAsync(definition.commandLine, {
			cwd: definition.workingDirectory,
			env: definition.env ? { ...process.env, ...definition.env } : process.env,
			timeout: definition.timeoutMs,
			shell: true,
		});

		toast.title = `${definition.title} finished`;
		toast.message = stdout?.trim() || stderr?.trim() || "Script completed.";
		toast.style = Toast.Style.Success;
	} catch (error) {
		const execError = error as ExecException & {
			stdout?: string;
			stderr?: string;
		};
		toast.title = `${definition.title} failed`;
		toast.message =
			execError.stderr?.trim() || execError.stdout?.trim() || execError.message || "Unknown error";
		toast.style = Toast.Style.Failure;
	}
}
