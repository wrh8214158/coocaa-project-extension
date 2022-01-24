// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import GetCommon from './components';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const arr: any = Object.entries(GetCommon(context)).map((item) => item[1]);

  context.subscriptions.push(...arr);
}

// this method is called when your extension is deactivated
export function deactivate() {}
