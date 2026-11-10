// Optional, stronger setup: run `node scripts/hash-password.mjs`, type the admin
// password, and put the printed line in the host setting ADMIN_PASSWORD_HASH
// (then remove ADMIN_PASSWORD). The password itself is not saved anywhere.
import { scryptSync, randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = await rl.question('Admin password: ');
rl.close();
const salt = randomBytes(16);
console.log(salt.toString('hex') + ':' + scryptSync(password, salt, 64).toString('hex'));
