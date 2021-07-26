#!/usr/bin/env node

import * as fs from 'node:fs';
import { transformString } from './transform-string.js';
import { readTextFromStdin } from './util.js';

async function main() {
  const inputText = await handleArgs();
  const output = transformString(inputText);
  console.log(output);
}

//==========

function logHelp(logFunc = console.log) {
  logFunc('async-off path/to/file.ts');
  logFunc('cat path/to/file.ts | async-off');
  logFunc();
  logFunc('async-off --help');
  logFunc('async-off -h');
}

async function handleArgs(): Promise<string> {
  let inputText;
  const args = process.argv.slice(2);
  switch (args.length) {
    case 0: {
      inputText = await readTextFromStdin();
      break;
    }
    case 1: {
      const filePath = args[0];
      if (filePath === '-h' || filePath === '--help') {
        logHelp();
        process.exit(0);
      }
      inputText = fs.readFileSync(filePath, { encoding: 'utf8' });
      break;
    }
    default: {
      console.error('Expected either one or no arguments!\n');
      logHelp(console.error);
      process.exit(1);
    }
  }
  return inputText;
}

//==========

main();
