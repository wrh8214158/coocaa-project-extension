export default {
  pluginName: 'coocaa npm',
  code: {
    startDev: {
      command: 'npm run dev',
      label: '本地运行(DEV)',
      // icon: "install.png",
      extension: 'extension.startDev'
    },
    startProd: {
      command: 'npm run prod',
      label: '本地运行(PROD)',
      // icon: "dev.png",
      extension: 'extension.startProd'
    },
    buildDev: {
      command: 'npm run build:dev --report',
      label: '项目打包(DEV)',
      // icon: "pro.png",
      extension: 'extension.buildDev'
    },
    buildProd: {
      command: 'npm run build --report',
      label: '项目打包(PROD)',
      // icon: "pro.png",
      extension: 'extension.buildProd'
    },
    packageUploadDev: {
      command: 'npm run deploy:dev',
      label: '一键打包上传（DEV）',
      // icon: "pro.png",
      extension: 'extension.packageUploadDev'
    }
  }
};
