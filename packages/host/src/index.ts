// Copyright (c) TileDB, Inc.
// Distributed under the terms of the Modified BSD License.
import { Endpoint, Remote, windowEndpoint, wrap } from 'comlink';

/**
 * Interface for remote command bridge operations.
 */
interface ICommandBridgeRemote {
  /**
   * Executes a command with given arguments.
   * @param command - The command to execute.
   * @param args - Arguments for the command.
   */
  execute: (command: string, args: Record<string, unknown>) => Promise<void>;

  /**
   * Lists all available commands.
   * @returns A promise that resolves to an array of command strings.
   */
  listCommands: () => Promise<string[]>;
}

/**
 * A bridge to expose actions on JupyterLab commands.
 */
export class CommandBridge {
  constructor({ iframeId }: CommandBridge.IOptions) {
    this._iframe = document.getElementById(iframeId) as HTMLIFrameElement;

    if (!this._iframe) {
      console.error('iframe not found');
      return;
    }

    this._childWindow = this._iframe.contentWindow;

    if (!this._childWindow) {
      console.error('child window not found');
      return;
    }

    this._endpoint = windowEndpoint(this._childWindow);
    this._remote = wrap(this._endpoint);
  }

  /**
   * Executes a command with the given arguments.
   * @param command - The command to execute.
   * @param args - Arguments for the command.
   * @throws Error if the remote connection is not established.
   * @returns A promise that resolves when the command execution is complete.
   */
  async execute(command: string, args: Record<string, unknown>): Promise<void> {
    if (!this._remote) {
      throw new Error('Remote connection not established');
    }
    await this._remote.execute(command, args);
  }

  /**
   * Lists all available commands.
   * @throws Error if the remote connection is not established.
   * @returns A promise that resolves to an array of command strings.
   */
  async listCommands(): Promise<string[]> {
    if (!this._remote) {
      throw new Error('Remote connection not established');
    }
    return this._remote.listCommands();
  }

  private _iframe: HTMLIFrameElement | null;
  private _childWindow: Window | undefined | null;
  private _endpoint: Endpoint | undefined;
  private _remote: Remote<ICommandBridgeRemote> | undefined;
}

export namespace CommandBridge {
  export interface IOptions {
    iframeId: string;
  }
}
