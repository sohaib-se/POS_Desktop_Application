import { initDatabase } from './init.mjs';

const initializedPath = initDatabase();

console.log(`SQLite setup complete.\nSchema: ${initializedPath}`);
