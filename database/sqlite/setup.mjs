import { initDatabase } from './init.mjs';
import { seedDatabase } from './seed.mjs';

const initializedPath = initDatabase();
const seededPath = seedDatabase();

console.log(`SQLite setup complete.\nSchema: ${initializedPath}\nSeeded: ${seededPath}`);
