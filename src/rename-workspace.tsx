import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Action,
  ActionPanel,
  Form,
  Icon,
  Toast,
  closeMainWindow,
  showToast,
} from "@vicinae/api";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type WorkspaceInfo = {
  id: number;
  name?: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function RenameWorkspaceCommand() {
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { stdout } = await execFileAsync("hyprctl", ["-j", "activeworkspace"]);
      const data = JSON.parse(stdout) as { id: number; name?: string | null };
      const name = data.name ?? "";
      setWorkspace({ id: data.id, name: name || undefined });
      setInput(name);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to read active workspace: ${message}`);
      await showToast({
        title: "Unable to load workspace",
        message,
        style: Toast.Style.Failure,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const handleRename = useCallback(
    async (requestedName?: string) => {
      if (!workspace) {
        await showToast({ title: "Workspace not ready", style: Toast.Style.Failure });
        return;
      }

      const rawInput = (requestedName ?? input ?? "").trim();
      const targetName = rawInput.length > 0 ? rawInput : String(workspace.id);
      const currentName = workspace.name ?? "";

      if (targetName === currentName || (targetName === String(workspace.id) && currentName === "")) {
        await showToast({
          title: "No changes",
          message: "Workspace name already matches the requested value.",
          style: Toast.Style.Success,
        });
        return;
      }

      const toast = await showToast({ title: "Renaming workspace…", style: Toast.Style.Animated });

      try {
        await execFileAsync("hyprctl", [
          "dispatch",
          "renameworkspace",
          String(workspace.id),
          targetName,
        ]);

        await sleep(300);

        try {
          await execFileAsync("qs", [
            "-c",
            "myshell",
            "ipc",
            "call",
            "WorkspaceOsd",
            "showWorkspaceOsd",
          ]);
        } catch (hudError) {
          console.warn("Failed to trigger workspace OSD", hudError);
        }

        toast.title = "Workspace renamed";
        toast.message = `Workspace ${workspace.id} is now '${targetName}'.`;
        toast.style = Toast.Style.Success;
        setWorkspace((prev) => (prev ? { ...prev, name: targetName === String(workspace.id) ? undefined : targetName } : prev));
        setInput(targetName === String(workspace.id) ? "" : targetName);
        await closeMainWindow();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        toast.title = "Rename failed";
        toast.message = message;
        toast.style = Toast.Style.Failure;
      }
    },
    [input, workspace]
  );

  const placeholder = useMemo(() => {
    if (!workspace) {
      return "Enter workspace name";
    }
    return `Workspace ${workspace.id}`;
  }, [workspace]);

  return (
    <Form
      title="Rename Workspace"
      navigationTitle="Rename Workspace"
      isLoading={loading}
      onSubmit={() => {
        void handleRename();
      }}
      actions={
        <ActionPanel>
          <Action
            title="Rename"
            icon={Icon.Pencil}
            autoFocus
            onAction={() => {
              void handleRename();
            }}
            shortcut={{ key: "enter", modifiers: [] }}
          />
          <Action
            title="Reset to Workspace ID"
            icon={Icon.ArrowCounterClockwise}
            onAction={() => {
              setInput("");
              void handleRename("");
            }}
          />
          <Action
            title="Reload Workspace Info"
            icon={Icon.Repeat}
            onAction={() => {
              void loadWorkspace();
            }}
          />
        </ActionPanel>
      }
    >
      {error ? <Form.Description title="Status" text={error} /> : null}
      {workspace ? (
        <Form.Description
          title="Current Workspace"
          text={`ID ${workspace.id}${workspace.name ? ` · ${workspace.name}` : ""}`}
        />
      ) : null}
      <Form.TextField
        id="workspaceName"
        title="New Name"
        value={input}
        onChange={setInput}
        autoFocus
        placeholder={placeholder}
        info="Leave empty to reset to the numeric workspace ID."
      />
    </Form>
  );
}
