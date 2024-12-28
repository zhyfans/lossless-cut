import { memo, useEffect, useState, useCallback, useRef, CSSProperties, MouseEventHandler, WheelEventHandler } from 'react';
import { Spinner } from 'evergreen-ui';

import { ffmpegExtractWindow } from '../util/constants';
import { RenderableWaveform } from '../types';


function BigWaveform({ waveforms, relevantTime, playing, durationSafe, zoom, seekRel, darkMode }: {
  waveforms: RenderableWaveform[],
  relevantTime: number,
  playing: boolean,
  durationSafe: number,
  zoom: number,
  seekRel: (a: number) => void,
  darkMode: boolean,
}) {
  const windowSize = ffmpegExtractWindow * 2;
  const windowStart = Math.max(0, relevantTime - windowSize);
  const windowEnd = relevantTime + windowSize;
  const filtered = waveforms.filter((waveform) => waveform.from >= windowStart && waveform.to <= windowEnd);

  const scaleFactor = zoom;

  const [smoothTimeRaw, setSmoothTime] = useState<number | undefined>(relevantTime);

  const smoothTime = smoothTimeRaw ?? relevantTime;

  const mouseDownRef = useRef<{ relevantTime: number, x }>();
  const containerRef = useRef<HTMLDivElement>(null);

  const getRect = useCallback(() => containerRef.current!.getBoundingClientRect(), []);

  const handleMouseDown = useCallback((e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;

    mouseDownRef.current = { relevantTime, x };
    e.preventDefault();
  }, [relevantTime]);

  const scaleToTime = useCallback((v: number) => (((v) / getRect().width) * windowSize) / zoom, [getRect, windowSize, zoom]);

  const handleMouseMove = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {
    if (mouseDownRef.current == null) return;

    seekRel(-scaleToTime(e.movementX));

    e.preventDefault();
  }, [scaleToTime, seekRel]);

  const handleWheel = useCallback<WheelEventHandler<HTMLDivElement>>((e) => {
    seekRel(scaleToTime(e.deltaX));
  }, [scaleToTime, seekRel]);

  const handleMouseUp = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {
    if (!mouseDownRef.current) return;
    mouseDownRef.current = undefined;
    e.preventDefault();
  }, []);


  useEffect(() => {
    const startTime = Date.now();

    if (playing) {
      let raf: number;
      // eslint-disable-next-line no-inner-declarations
      function render() {
        raf = window.requestAnimationFrame(() => {
          setSmoothTime(relevantTime + (Date.now() - startTime) / 1000);
          render();
        });
      }

      render();
      return () => window.cancelAnimationFrame(raf);
    }

    setSmoothTime(undefined);

    return undefined;
  }, [relevantTime, playing]);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={containerRef}
      style={{ height: '100%', width: '100%', position: 'relative', cursor: 'grab', backgroundColor: 'var(--gray3)' }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
    >
      {filtered.map((waveform) => {
        const left = 0.5 + ((waveform.from - smoothTime) / windowSize) * scaleFactor;
        const width = ((waveform.to - waveform.from) / windowSize) * scaleFactor;
        const leftPercent = `${left * 100}%`;
        const widthPercent = `${width * 100}%`;

        const style: CSSProperties = {
          pointerEvents: 'none',
          position: 'absolute',
          height: '100%',
          width: widthPercent,
          left: leftPercent,
          borderLeft: waveform.from === 0 ? '1px solid var(--gray11)' : undefined,
          borderRight: waveform.to >= durationSafe ? '1px solid var(--gray11)' : undefined,
          filter: darkMode ? undefined : 'invert(1)',
        };

        if (waveform.url == null) {
          return (
            <div
              key={`${waveform.from}-${waveform.to}`}
              draggable={false}
              style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Spinner />
            </div>
          );
        }

        return (
          <img
            key={`${waveform.from}-${waveform.to}`}
            src={waveform.url}
            draggable={false}
            alt=""
            style={style}
          />
        );
      })}

      <div style={{ pointerEvents: 'none', position: 'absolute', height: '100%', backgroundColor: 'var(--red11)', width: 1, left: '50%', top: 0 }} />
    </div>
  );
}

export default memo(BigWaveform);
