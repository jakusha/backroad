#!/usr/bin/env node

import { Command } from 'commander';
import { join } from 'path';
import { startBackroadServer } from 'backroad-server';
const program = new Command();
console.log('running backroad cli');
program.name('backroad').description('Run a backroad script in dev mode');

program.command('run <file>').action((file) => {
  const targetScriptPath = join(process.cwd(), file);
  startBackroadServer({ scriptPath: targetScriptPath });
});

program.command('push').action(() => {
  console.log('coming soon 💫');
});
program.parse();
