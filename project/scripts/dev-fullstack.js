import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';

function run(name, command, args) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: isWindows,
    env: { ...process.env },
  });

  child.on('exit', code => {
    if (shuttingDown) return;
    console.log(`\n${name} stopped with code ${code}. Shutting down Torials...`);
    shutdown(code || 0);
  });

  return child;
}

let shuttingDown = false;
const server = run('backend', 'node', ['server/index.js']);
const client = run('frontend', 'vite', ['--host', '0.0.0.0']);

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  server.kill('SIGTERM');
  client.kill('SIGTERM');
  setTimeout(() => process.exit(code), 300);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
