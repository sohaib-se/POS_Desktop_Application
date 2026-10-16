const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function registerLsbIcon() {
  const icoPath = path.resolve(__dirname, '../assets/File Icons/backup.ico');
  if (!fs.existsSync(icoPath)) {
    console.error('Icon file not found at:', icoPath);
    return;
  }

  try {
    execSync('reg add "HKCU\\Software\\Classes\\.lsb" /ve /d "LaimsoftPOS.Backup" /f', { stdio: 'pipe' });
    execSync('reg add "HKCU\\Software\\Classes\\LaimsoftPOS.Backup" /ve /d "Laimsoft POS Backup File" /f', { stdio: 'pipe' });
    execSync(`reg add "HKCU\\Software\\Classes\\LaimsoftPOS.Backup\\DefaultIcon" /ve /d "${icoPath}" /f`, { stdio: 'pipe' });
    
    // Notify Windows Explorer to refresh icon cache
    try {
      execSync('ie4uinit.exe -show', { stdio: 'ignore' });
    } catch {}

    console.log('Successfully registered .lsb file icon in Windows Registry:');
    console.log(icoPath);
  } catch (err) {
    console.error('Failed to register file icon:', err.message);
  }
}

if (require.main === module) {
  registerLsbIcon();
}

module.exports = { registerLsbIcon };
