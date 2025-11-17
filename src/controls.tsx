import React from "react";
import { Action, ActionPanel, Icon, List } from "@vicinae/api";
import { runShellScript, scripts } from "./scripts";

const visibleScripts = scripts.filter((script) => !script.hiddenFromList);

export default function ScriptCatalog() {
	return (
		<List
			searchBarPlaceholder="Search scripts…"
			isShowingDetail={visibleScripts.length > 0}
		>
			<List.EmptyView
				title="No scripts yet"
				description="Duplicate the sample entry in src/scripts.ts to add your own commands."
				icon={Icon.Terminal}
			/>
			<List.Section title="Configured Scripts" subtitle={`${visibleScripts.length} items`}>
				{visibleScripts.map((script) => (
					<List.Item
						key={script.id}
						title={script.title}
						subtitle={script.commandLine}
						icon={script.icon ?? Icon.Terminal}
						keywords={script.keywords}
						actions={
							<ActionPanel>
								<Action
									title="Run Script"
									icon={Icon.Play}
									onAction={() => runShellScript(script)}
								/>
								<Action.CopyToClipboard title="Copy Command" content={script.commandLine} />
							</ActionPanel>
						}
						detail={
							<List.Item.Detail
								markdown={
									script.description
									? script.description
									: "Add a description in src/scripts.ts to document this script."
								}
							/>
						}
					/>
				))}
			</List.Section>
		</List>
	);
}
