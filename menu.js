const {
  app,
  Menu,
  shell,
  ipcMain,
  BrowserWindow,
  globalShortcut,
  dialog,
} = require("electron");
const fs = require("fs");
//  newest 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
function saveFile() {
  console.log("Saving the file");
  const window = BrowserWindow.getFocusedWindow();
  window.webContents.send("editor-event", "save");
}
function loadFile() {
  const window = BrowserWindow.getFocusedWindow();
  const options = {
    title: "Pick a markdown file",
    filters: [
      { name: "Markdown files", extensions: ["md"] },
      { name: "Text files", extensions: ["txt"] },
    ],
  };
  dialog.showOpenDialog(window, options).then((paths) => {
    if (!paths.canceled) {
      const content = fs.readFileSync(paths.filePaths[0]).toString();
      window.webContents.send("load", content);
    }
  });
}
ipcMain.on("editor-reply", (event, arg) => {
  console.log(`Received reply from web page: ${arg}`);
});
ipcMain.on("save", (event, arg) => {
  console.log(`Saving: ${arg}`);
  const window = BrowserWindow.getFocusedWindow();
  const options = {
    title: "Save markdown file",
    filters: [
      {
        name: "MyFile",
        extensions: ["md"],
      },
    ],
  };
  dialog.showSaveDialog(window, options).then((filename) => {
    console.log(filename);
    if (!filename.canceled) {
      fs.writeFileSync(filename.filePath, arg);
    }
  });
});

app.on("ready", () => {
  globalShortcut.register("CommandOrControl+S", () => {
    saveFile();
  });
  globalShortcut.register("CommandOrControl+O", () => {
    loadFile();
  });
});

const template = [
  {
    label: "FileUpdate",
    submenu: [
      {
        label: "Savesss",
        click() {
          saveFile();
        },
      },
      {
        label: "Open",
        click() {
          loadFile();
        },
      },
    ],
  },
  {
    label: "Format",
    submenu: [
      {
        label: "Toggle Bold",
        click() {
          const window = BrowserWindow.getFocusedWindow();
          window.webContents.send("editor-event", "toggle-bold");
        },
      },
    ],
  },
  {
    role: "help",
    submenu: [
      {
        label: "About Editor Component",
        click() {
          shell.openExternal("https://simplemde.com/");
        },
        accelerator: "Alt+R",
      },
    ],
  },
];
if (process.env.DEBUG) {
  template.push({
    label: "Debugging",
    submenu: [
      {
        label: "Dev Tools",
        role: "toggleDevTools",
      },
      { type: "separator" },
      {
        role: "reload",
      },
    ],
  });
}
const menu = Menu.buildFromTemplate(template);
module.exports = menu;
