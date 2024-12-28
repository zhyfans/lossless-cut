/* eslint-disable no-console */
import assert from 'node:assert';
import { execa } from 'execa';
import ky from 'ky';
import os from 'node:os';
import timers from 'node:timers/promises';


const losslessCutExePath = process.argv[2];
assert(losslessCutExePath);
const screenshotDevice = process.argv[3];
const screenshotOutPath = process.argv[4];
assert(screenshotOutPath);


const port = 8081;

const ps = execa(losslessCutExePath, ['--http-api', String(port)], { forceKillAfterDelay: 10000 });

console.log('Started', losslessCutExePath);

// eslint-disable-next-line unicorn/prefer-top-level-await
ps.catch((err) => console.error(err));

const client = ky.extend({ prefixUrl: `http://127.0.0.1:${port}` });

async function captureScreenshot(outPath: string) {
  // https://trac.ffmpeg.org/wiki/Capture/Desktop#Windows

  const platform = os.platform();

  if (platform === 'darwin') {
    const { stderr } = await execa('ffmpeg', ['-f', 'avfoundation', '-list_devices', 'true', '-i', '', '-hide_banner'], { reject: false, timeout: 30000 });
    console.log(stderr);
  }

  assert(screenshotDevice);

  await execa('ffmpeg', [
    ...(platform === 'darwin' ? ['-r', '30', '-pix_fmt', 'uyvy422', '-f', 'avfoundation'] : []),
    ...(platform === 'win32' ? ['-f', 'gdigrab', '-framerate', '30'] : []),
    ...(platform === 'linux' ? ['-framerate', '25', '-f', 'x11grab'] : []),
    '-i', screenshotDevice,
    '-vframes', '1', outPath,
  ], { timeout: 30000 });
}

try {
  const resp = await client('', {
    timeout: 5000,
    retry: { backoffLimit: 5000, limit: 10 },
    hooks: { beforeRequest: [() => { console.log('attempt'); }] },
  }).text();
  assert(resp.length > 0);

  console.log('Waiting for UI to settle');

  await timers.setTimeout(5000);

  console.log('Capturing screenshot');

  await captureScreenshot(screenshotOutPath);

  console.log('Sending quit command');

  try {
    await client.post('api/action/quit').text();
  } catch (err) {
    console.warn('Quit command failed', err);
    ps.kill();
  }
} finally {
  // ps.cancel();
}

console.log('Waiting for app to quit');

try {
  const { stdout, stderr } = await ps;
  console.log('App exited');
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
} catch (err) {
  console.warn(err);
}
