// eslint-disable-next-line import/no-extraneous-dependencies
import { AboutPanelOptionsOptions, app } from 'electron';

import { appName, copyrightYear } from './common.js';
import { isLinux } from './util.js';
import isStoreBuild from './isStoreBuild.js';
import { githubLink, homepage } from './constants.js';


// eslint-disable-next-line import/prefer-default-export
export function getAboutPanelOptions() {
  const showVersion = !isStoreBuild;

  const appVersion = app.getVersion();

  const aboutPanelLines = [
    isStoreBuild ? homepage : githubLink,
    '',
    `Copyright © 2016-${copyrightYear} Mikael Finstad ❤️ 🇳🇴`,
  ];

  const aboutPanelOptions: AboutPanelOptionsOptions = {
    applicationName: appName,
    copyright: aboutPanelLines.join('\n'),
    version: '', // not very useful (supported on MacOS only, and same as applicationVersion)
  };

  // https://github.com/electron/electron/issues/18918
  // https://github.com/mifi/lossless-cut/issues/1537
  if (isLinux) {
    aboutPanelOptions.applicationVersion = appVersion;
  } else if (!showVersion) {
    // https://github.com/mifi/lossless-cut/issues/1882
    aboutPanelOptions.applicationVersion = `${process.windowsStore ? 'Microsoft Store' : 'App Store'} edition, based on GitHub v${appVersion}`;
  }

  return aboutPanelOptions;
}
