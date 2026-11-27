import {Config} from '@remotion/cli/config';
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setConcurrency(4);
// Chromium préinstallé dans l'environnement cloud (ignoré s'il n'existe pas)
import fs from 'fs';
const chrome = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (fs.existsSync(chrome)) Config.setBrowserExecutable(chrome);
