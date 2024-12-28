import { memo } from 'react';

import { useTranslation, Trans } from 'react-i18next';

import SetCutpointButton from './components/SetCutpointButton';
import SimpleModeButton from './components/SimpleModeButton';
import useUserSettings from './hooks/useUserSettings';
import { StateSegment } from './types';

const electron = window.require('electron');

function NoFileLoaded({ mifiLink, currentCutSeg, onClick, darkMode }: {
  mifiLink: unknown,
  currentCutSeg: StateSegment,
  onClick: () => void,
  darkMode?: boolean,
}) {
  const { t } = useTranslation();
  const { simpleMode } = useUserSettings();

  return (
    <div
      className="no-user-select"
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, border: '.7em dashed var(--gray3)', color: 'var(--gray12)', margin: '2em', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap' }}
      role="button"
      onClick={onClick}
    >
      <div style={{ fontSize: '2em', textTransform: 'uppercase', color: 'var(--gray11)', marginBottom: '.2em' }}>{t('DROP FILE(S)')}</div>

      <div style={{ fontSize: '1.3em', color: 'var(--gray11)', marginBottom: '.1em' }}>
        <Trans>See <b>Help</b> menu for help</Trans>
      </div>

      <div style={{ fontSize: '1.3em', color: 'var(--gray11)' }}>
        <Trans><SetCutpointButton currentCutSeg={currentCutSeg} side="start" style={{ verticalAlign: 'middle' }} /> <SetCutpointButton currentCutSeg={currentCutSeg} side="end" style={{ verticalAlign: 'middle' }} /> or <kbd>I</kbd> <kbd>O</kbd> to set cutpoints</Trans>
      </div>

      <div style={{ fontSize: '1.3em', color: 'var(--gray11)' }} role="button" onClick={(e) => e.stopPropagation()}>
        {simpleMode ? (
          <Trans><SimpleModeButton style={{ verticalAlign: 'middle' }} size={16} /> to show advanced view</Trans>
        ) : (
          <Trans><SimpleModeButton style={{ verticalAlign: 'middle' }} size={16} /> to show simple view</Trans>
        )}
      </div>

      {mifiLink && typeof mifiLink === 'object' && 'loadUrl' in mifiLink && typeof mifiLink.loadUrl === 'string' && mifiLink.loadUrl ? (
        <div style={{ position: 'relative', margin: '.3em', width: '24em', height: '8em' }}>
          <iframe src={`${mifiLink.loadUrl}#dark=${darkMode ? 'true' : 'false'}`} title="iframe" style={{ background: 'rgba(0,0,0,0)', border: 'none', pointerEvents: 'none', width: '100%', height: '100%', position: 'absolute', colorScheme: 'initial' }} />
          {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
          <div style={{ width: '100%', height: '100%', position: 'absolute', cursor: 'pointer' }} role="button" onClick={(e) => { e.stopPropagation(); if ('targetUrl' in mifiLink && typeof mifiLink.targetUrl === 'string') electron.shell.openExternal(mifiLink.targetUrl); }} />
        </div>
      ) : undefined}
    </div>
  );
}

export default memo(NoFileLoaded);
