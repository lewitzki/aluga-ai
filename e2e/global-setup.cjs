const { execSync } = require('node:child_process');
const path = require('node:path');

/** Prepara BD de testes e frontend estático antes do Chromium abrir páginas. */
module.exports = async function globalSetup() {
    const root = path.resolve(__dirname, '..');
    const shell = process.platform === 'win32';

    execSync('php artisan migrate:fresh --seed --force', {
        cwd: root,
        stdio: 'inherit',
        shell,
    });

    execSync('npm run build', {
        cwd: root,
        stdio: 'inherit',
        shell,
    });
};
