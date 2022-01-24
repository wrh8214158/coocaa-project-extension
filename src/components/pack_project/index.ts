// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import constants from './constants';
import { localize } from 'vscode-nls-i18n';

const commond = Object.entries(constants.code).map((item) => {
  const value = item[1];
  return vscode.commands.registerCommand(value.extension, (uri) => {
    // 文件路径
    const filePath = uri.path.substring(1);
    const fileStat = fs.statSync(filePath);
    if (fileStat.isDirectory()) {
      const fileDir = fs.readdirSync(filePath);
      const routerFileName = fileDir.find((item) => /^manifest\.json$/g.test(item));
      if (routerFileName) {
        // const fullRouterFilePath = path.posix.join(filePath + '/' + routerFileName); // 完整的 manifest 文件路径
        const folderName = path.posix.basename(filePath);
        const terminal = vscode.window.createTerminal({ name: constants.pluginName });
        terminal.show(true);
        // terminal.sendText(`${value.command} -- --path=${fullRouterFilePath}`);
        terminal.sendText(`${value.command} --module=${folderName}`);
      } else {
        vscode.window.showWarningMessage(localize('extension.packProjectNotFoundManifest.tips'));
      }
    } else {
      vscode.window.showWarningMessage(localize('extension.packProjectNotFolder.tips'));
    }
  });
});

export default commond;
