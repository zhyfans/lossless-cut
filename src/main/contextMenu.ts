// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, Menu } from 'electron';

// https://github.com/electron/electron/issues/4068#issuecomment-274159726
export default (window: BrowserWindow) => {
  const selectionMenu = Menu.buildFromTemplate([
    { role: 'copy' },
    { type: 'separator' },
    { role: 'selectAll' },
  ]);

  const inputMenu = Menu.buildFromTemplate([
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' },
    { type: 'separator' },
    { role: 'selectAll' },
  ]);

  window.webContents.on('context-menu', (_e, props) => {
    const { selectionText, isEditable } = props;
    if (isEditable) {
      inputMenu.popup({ window });
    } else if (selectionText && selectionText.trim() !== '') {
      selectionMenu.popup({ window });
    }
  });
};
