const electron = require('electron');
const { app, BrowserWindow, Menu, ipcMain } = electron;
const path = require('path');
const url = require('url');

let win = null;
let addWin = null;
app.on('ready', () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true, // 支持node在html
        }
    });
    win.loadURL(url.format({
        pathname: path.resolve(__dirname, './html/main.html'),
        protocol: 'file',
        slashes: true,
    }));
    // 定义菜单
    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);

    // 点击主窗口的关闭按钮
    win.on('closed', () => {
        // 应用关闭
        app.quit();
    })
})

// 顶部菜单模板
const menuTemplate = [
    // 文件菜单项
    {
        label: '文件',
        submenu: [
            {
                label: '新增信息', click: () => {
                    createAddWindow()
                }
            },
            {
                label: '清空信息', click: () => {
                    win.webContents.send('info:clear');
                }
            },
            {
                label: '退出',
                accelerator: process.platform == 'darwin' ? 'command+d' : 'ctrl+d',
                click: () => {
                    app.quit();
                }
            }
        ]
    },
]

// 新增窗口
const createAddWindow = () => {
    addWin = new BrowserWindow({
        width: 600,
        height: 300,
        webPreferences: {
            nodeIntegration: true, // 支持node在html
        }
    });
    addWin.loadURL(url.format({
        pathname: path.resolve(__dirname, './html/add.html'),
        protocol: 'file',
        slashes: true,
    }));
}
// 检测当前环境
const checkEnv = () => {
    if (process.env.NODE_ENV == undefined) {
        process.env.NODE_ENV = 'production';
    }
    let env = process.env.NODE_ENV;
    let devConfig =
    // 开发者工具菜单项
    {
        label: '开发者工具',
        submenu: [
            {
                label: '打开/关闭',
                accelerator: process.platform == 'darwin' ? 'command+i' : 'ctrl+i',
                click: (item, focusedWindow) => {
                    focusedWindow.toggleDevTools();
                }
            },
            { label: '刷新', role: 'reload', accelerator: process.platform == 'darwin' ? 'command+f5' : 'ctrl+f5' },
        ]
    }
    // 开发环境
    if (env !== 'production') {
        menuTemplate.push(devConfig);
    }
}
checkEnv();

// 事件监听：监听时间信息的传递
const eventListener = () => {
    // 主进程 监听新增窗口传递过来的信息项
    ipcMain.on('info:add', (e, val) => {
        win.webContents.send('info:add', val);
        addWin.close();
    })
}
eventListener();