import { fileURLToPath } from 'node:url';
import path from 'node:path';
import createNextEslint from '@hackersdeal/config/eslint/next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default createNextEslint(__dirname);
