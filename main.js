const electron = require('electron');
const url = require('url');
const path = require('path');

const {app,BrowserWindow, Menu, ipcMain} = electron;

// set env
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', ()=> {
    //create windor
    mainWindow = new BrowserWindow({webPreferences: {
        nodeIntegration: true
    }});
    //load html to the window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname,'mainWindow.html'),
        protocol:'file:',
        slashes: true
    }));
    //quit app when closed
    mainWindow.on('closed',function(){
        app.quit();
    })

    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //insert menu
    Menu.setApplicationMenu(mainMenu)
});

//handle add window
function createAddWindow() {
    //create windor
    addWindow = new BrowserWindow({
        width:300,
        height:200,
        title:'Add Shopping list item',
        webPreferences: {
            nodeIntegration: true
        }
    });
    //load html to the window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname,'addWindow.html'),
        protocol:'file:',
        slashes: true
    }));
    //garbage collection
    addWindow.on('close',function(){
        addWindow = null;
    })
}

//catch item:add
ipcMain.on('item:add',(e,item)=>{
    console.log(item)
    mainWindow.webContents.send('item:add',item);
    addWindow.close();
})

// creat menu template
const mainMenuTemplate = [
    {
        label:'File',
        submenu:[
            {
                label:'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label:'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label:'Quit',
                accelerator:process.platform == 'darwin' ? 'Command+Q':'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]

    }
];

// If mac, add empty obj to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({}); //add to the biningging
}

// Add dev tools if not in prod
if(process.env.NODE_ENV != 'production'){
    mainMenuTemplate.push({
        label:'Developer Tools',
        submenu:[
            {
                label:'Toggle DevTools',
                accelerator:process.platform == 'darwin' ? 'Command+I':'Ctrl+I',
                click(item,focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role:'reload'
            }
        ]
    })
}