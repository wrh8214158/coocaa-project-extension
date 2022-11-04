// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { localize } from 'vscode-nls-i18n';

const webviewCommand = (context: vscode.ExtensionContext) => {
  // 追踪当前 webview 面板
  let currentPanel: vscode.WebviewPanel | undefined = undefined;

  return vscode.commands.registerCommand('extension.newProject', (uri) => {
    // 获取当前活动的编辑器
    const columnToShowIn = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (currentPanel) {
      // 如果我们已经有了一个面板，那就把它显示到目标列布局中
      currentPanel.reveal(columnToShowIn);
    } else {
      // 创建和展示一个 webview
      currentPanel = vscode.window.createWebviewPanel(
        'hgWebview', // 定义 webview 的类型，用于内部
        localize('extension.webviewPanel.title'), // 给用户展示的标题
        vscode.ViewColumn.One, // 在第几栏编辑器里展示这个 webview
        {
          enableScripts: true,
          retainContextWhenHidden: true
        } // 其他 Webview 配置.
      );
      // 设置 logo
      currentPanel.iconPath = vscode.Uri.file(
        path.join(context.extensionPath, 'assets', 'setting.png')
      );
      // 当前面板被关闭后重置
      currentPanel.onDidDispose(() => (currentPanel = undefined), null, context.subscriptions);
    }

    // 替换本地路径
    const getWebViewContent = (context: vscode.ExtensionContext, templatePath: string) => {
      const resourcePath = path.join(context.extensionPath, templatePath);
      const dirPath = path.dirname(resourcePath);
      let html = fs.readFileSync(resourcePath, 'utf-8');
      html = html
        .replace(
          /(<link.+?href="|<script.+?src="|<iframe.+?src="|<img.+?src=")(.+?)"/g,
          (m, $1, $2) => {
            if ($2.indexOf('https://') < 0) {
              return (
                $1 +
                (currentPanel as vscode.WebviewPanel).webview.asWebviewUri(
                  vscode.Uri.file(path.resolve(dirPath, $2))
                ) +
                '"'
              );
            } else {
              return $1 + $2 + '"';
            }
          }
        )
        .replace(
          /window.vscodeLangage = '(.*)'/g,
          `window.vscodeLangage = "${vscode.env.language}"`
        );
      return html;
    };

    // 处理 webview 中的信息
    currentPanel.webview.onDidReceiveMessage(
      (message) => {
        if (message.method === 'createProject') {
          // 创建项目
          const params = JSON.parse(message.params || '{}');
          createFile(uri, params, currentPanel);
        }
      },
      undefined,
      context.subscriptions
    );

    currentPanel.webview.html = getWebViewContent(context, 'webview/dist/index.html');
  });
};

// 开始创建项目
const createFile = (uri: any, params: any, currentPanel: any) => {
  // 文件路径
  const filePath = uri.path.substring(1);
  const fileStat = fs.statSync(filePath);
  if (fileStat.isDirectory()) {
    const fileDir = fs.readdirSync(filePath);
    const reg = RegExp(params.projectName);
    const hasSameFolder = fileDir.some((item) => reg.test(item));
    if (hasSameFolder) {
      vscode.window.showErrorMessage(localize('extension.hasSameFolder.tips'));
      return;
    } else {
      fs.mkdirSync(filePath + '/' + params.projectName);
      recursiveFile(params, filePath);
    }
  }
  vscode.window.showInformationMessage(localize('extension.createProjectSuccess.tips'));
  currentPanel.dispose();
};

// 递归
const recursiveFile = (params: any, path: string) => {
  const arr = params.treeData.filter((item: any) => !item.parent);
  const recursive = (list: any, listPath: string) => {
    list.forEach((item: any) => {
      const currFilePath = listPath + '/' + item.label;
      if (item.type === 'file') {
        const tmpl = createModel(item, params);
        fs.writeFileSync(currFilePath, tmpl);
      } else if (item.type === 'folder') {
        fs.mkdirSync(currFilePath);
      }
      if (item?.children?.length) {
        return recursive(item.children, currFilePath);
      }
    });
  };
  recursive(arr, `${path}/${params.projectName}`);
};

// 创建 tmpl 模板
const createModel = (item: any, params: any) => {
  if (!item.parent) {
    const projectName = params.projectName;
    const fixName = toCamel(projectName);
    const firstUpperCaseFixName = fixName.charAt(0).toUpperCase() + fixName.slice(1);
    if (item.label === 'readme.md') {
      // 如果文件名为 readme.md ，并且他没有父级，说明是第一个
      return params.textarea;
    } else if (/.+\.vue$/.test(item.label)) {
      // 第一级的 vue 文件
      const scssName = params.treeData.find(
        (itemParams: any) => itemParams.label === `${projectName}.scss`
      );
      return `<template>
                <div class="${projectName}"></div>
              </template>
              
              <script lang="ts">
              import ${firstUpperCaseFixName} from './${projectName}';
              export default ${firstUpperCaseFixName};
              </script>
              
              <style lang="scss" scoped>
              ${scssName ? `@import './${projectName}.scss';` : ''}
              </style>
              `.replace(/\s{15}/g, '\n');
    } else if (/.+\.ts$/.test(item.label)) {
      // 第一级的 ts 文件
      return `import { Component, Vue } from 'vue-property-decorator';
              
              @Component({ name: '${firstUpperCaseFixName}', components: {} })
              export default class ${firstUpperCaseFixName} extends Vue {
              
              }
              `.replace(/\s{15}/g, '\n');
    } else if (item.label === 'index.js') {
      // 第一级的 index.js 文件
      return `import ${firstUpperCaseFixName} from './${projectName}.vue';
              
              export default ${firstUpperCaseFixName};
              `.replace(/\s{15}/g, '\n');
    } else if (item.label === 'manifest.json') {
      // 第一级的 manifest.json 文件
      return (
        params.frameType === 'tv'
          ? `{
                "start_url": "/",
                "name": "${projectName}",
                "type": "tv",
                "short_name": "${projectName}",
                "icons": [],
                "display": "standalone",
                "background_color": "#1b2740",
                "theme_color": "#1b2740",
                "route": {
                  "path": "/${fixName}",
                  "name": "${projectName}",
                  "meta": {
                    "title": "${params.metaTitle || ''}"
                  }
                }
              }
              `
          : `{
                "start_url": "/",
                "name": "${projectName}",
                "type": "wx",
                "loginType": "wx",
                "get_device_list": false,
                "vuex_persisted_state": [],
                "short_name": "${projectName}",
                "icons": [],
                "display": "standalone",
                "background_color": "#1b2740",
                "theme_color": "#1b2740",
                "route": {
                  "path": "/${fixName}",
                  "name": "${projectName}",
                  "meta": {
                    "title": "${params.metaTitle || ''}",
                    "requireLogin": false
                  }
                },
                "wx_params": {
                  "scope": "snsapi_userinfo",
                  "updateAppMessageShareData": {
                    "title": "",
                    "desc": "",
                    "link": "",
                    "imgUrl": "",
                    "type": "",
                    "dataUrl": ""
                  },
                  "updateTimelineShareData": {
                    "title": "",
                    "link": "",
                    "imgUrl": ""
                  },
                  "development": {
                    "restful_sign_key": "",
                    "restful_client_key": "",
                    "client_id_wx": "",
                    "client_secret_wx": "",
                    "wxAppId": "",
                    "jsApiList": []
                  },
                  "production": {
                    "restful_sign_key": "",
                    "restful_client_key": "",
                    "client_id_wx": "",
                    "client_secret_wx": "",
                    "wxAppId": "",
                    "jsApiList": []
                  }
                },
                "cc_params": {
                  "development": {
                    "client_id_passport": "",
                    "client_secret_passport": "",
                    "login_method": "",
                    "theme": ""
                  },
                  "production": {
                    "client_id_passport": "",
                    "client_secret_passport": "",
                    "login_method": "",
                    "theme": ""
                  }
                },
                "cc_log": {}
              }
              `
      ).replace(/\s{15}/g, '\n');
    } else {
      return '';
    }
  } else {
    return '';
  }
};

// 下划线和横杠转驼峰
const toCamel = (str: string) => {
  return str.replace(
    /([^(\_|\-)])(?:[(\_|\-)]+([^(\_|\-)]))/g,
    ($0, $1, $2) => $1 + $2.toUpperCase()
  );
};

export default webviewCommand;
