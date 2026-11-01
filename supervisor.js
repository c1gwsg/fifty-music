import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_PATH = path.join(__dirname, 'server.js');
const CLOUDFLARED_PATH = path.join(__dirname, 'cloudflared.exe');
const TUNNEL_URL_PATH = path.join(__dirname, 'tunnel_url.txt');
const DESKTOP_URL_PATH = 'C:\\Users\\bakaz\\OneDrive\\Desktop\\Fifty_Music_URL.txt';

let serverProc = null;
let tunnelProc = null;
let currentTunnelUrl = '';

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}\n`;
  try {
    fs.appendFileSync(path.join(__dirname, 'service.log'), line);
  } catch {}
  console.log(line.trim());
}

function startServer() {
  log('Starting Fifty Node server...');
  serverProc = spawn('node', [SERVER_PATH], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProc.stdout.on('data', (d) => log(`[Server] ${d.toString().trim()}`));
  serverProc.stderr.on('data', (d) => log(`[Server ERR] ${d.toString().trim()}`));

  serverProc.on('exit', (code) => {
    log(`Server exited with code ${code}. Restarting in 3s...`);
    setTimeout(startServer, 3000);
  });
}

function startTunnel() {
  log('Starting Cloudflare Tunnel...');
  tunnelProc = spawn(CLOUDFLARED_PATH, ['tunnel', '--url', 'http://localhost:5173'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const onData = (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && match[0] !== currentTunnelUrl) {
      currentTunnelUrl = match[0];
      log(`Cloudflare Tunnel Active: ${currentTunnelUrl}`);
      try {
        fs.writeFileSync(TUNNEL_URL_PATH, currentTunnelUrl);
        const desktopContent = [
          '======================================================',
          '        Fifty - High-Fidelity Music Streaming Service',
          '======================================================',
          '',
          'Public Cloudflare Link (Use on iPhone / 5G / Anywhere):',
          currentTunnelUrl,
          '',
          'Local Wi-Fi Link (Same Wi-Fi network):',
          'http://192.168.18.182:5173',
          '',
          'Status: RUNNING IN BACKGROUND 24/7',
          'You can close Antigravity anytime - music will continue uninterrupted!',
          '======================================================'
        ].join('\r\n');
        fs.writeFileSync(DESKTOP_URL_PATH, desktopContent);
      } catch (err) {
        log(`Failed to write URL files: ${err.message}`);
      }
    }
  };

  tunnelProc.stdout.on('data', onData);
  tunnelProc.stderr.on('data', onData);

  tunnelProc.on('exit', (code) => {
    log(`Tunnel exited with code ${code}. Restarting in 5s...`);
    setTimeout(startTunnel, 5000);
  });
}

function shutdown() {
  log('Shutting down Fifty supervisor...');
  if (serverProc) serverProc.kill();
  if (tunnelProc) tunnelProc.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
// Wait 1.5 seconds for server to bind port before starting tunnel
setTimeout(startTunnel, 1500);
