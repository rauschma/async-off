import { splitLines } from "./util.js";

const Directive = {
  AsyncOpen: /^\s*\/\/<async>/,
  AsyncClose: /^\s*\/\/<\/async>/,
  SyncOpen: /^\s*\/\/<sync>/,
  SyncClose: /^\s*\/\/<\/sync>/,
  ConfigOpen: /^\s*\/\/<async-off-config>/,
  ConfigClose: /^\s*\/\/<\/async-off-config>/,
};

const State = {
  Normal: 'Normal',
  Async: '<async>',
  Sync: '<sync>',
  Config: '<async-off-config>',
} as const;
type State = (typeof State)[keyof (typeof State)];

export function postProcess(text: string): string {
  const output = [];
  const lines = splitLines(text);
  let state: State = State.Normal;
  lineLoop: for (let line of lines) {
    switch (state) {
      case State.Normal: {
        if (Directive.AsyncOpen.test(line)) {
          state = State.Async;
          continue lineLoop; // not in output
        } else if (Directive.SyncOpen.test(line)) {
          state = State.Sync;
          continue lineLoop; // not in output
        } else if (Directive.ConfigOpen.test(line)) {
          state = State.Config;
          continue lineLoop; // not in output
        }
        break;
      }
      case State.Async: {
        if (isDirective(state, line, Directive.AsyncClose)) {
          state = State.Normal;
        }
        continue lineLoop; // not in output
      }
      case State.Config: {
        if (isDirective(state, line, Directive.ConfigClose)) {
          state = State.Normal;
        }
        continue lineLoop; // not in output
      }
      case State.Sync: {
        if (isDirective(state, line, Directive.SyncClose)) {
          state = State.Normal;
          continue lineLoop; // not in output
        } else {
          line = line.replace(/^(\s*)\/\/ ?/, '$1');
        }
        break;
      }
    }
    output.push(line);
  }
  if (state !== State.Normal) {
    throw new Error('File finished inside ' + state);
  }
  return output.join('');
}

function isDirective(state: State, line: string, directiveRegExp: RegExp): boolean {
  if (directiveRegExp.test(line)) {
    return true;
  }
  // Any other directive is an error!
  for (const regExp of Object.values(Directive)) {
    if (regExp.test(line)) {
      throw new Error(`Illegal directive inside ${state}: ${line}`);
    }
  }
  return false;
}
