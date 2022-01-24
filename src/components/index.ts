import * as vscode from 'vscode';
import createProject from './create_project';
import packProject from './pack_project';
import { init } from 'vscode-nls-i18n';

const getCommon = (context: vscode.ExtensionContext) => {
  init(context.extensionPath); // 初始化国际化配置。只用在扩展激活时初始化一次
  return {
    createProject: createProject(context),
    ...packProject
  };
};

export default getCommon;
