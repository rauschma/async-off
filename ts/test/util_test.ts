import * as assert from 'assert/strict';
import { dedent, splitLines } from '../src/util.js';

suite('util_test.ts');

test('dedent', () => {
  assert.equal(
    dedent('\n  a\n    b\n  c\n'),
    'a\n  b\nc');
});

test('splitLines', () => {
  assert.deepEqual(
    splitLines('have\n  a good  \nday\n'),
    [
      'have\n',
      '  a good  \n',
      'day\n',
    ]
  );
  assert.deepEqual(
    splitLines('have\n  a good  \nday'),
    [
      'have\n',
      '  a good  \n',
      'day',
    ]
  );
  assert.deepEqual(
    splitLines('word'),
    [
      'word',
    ]
  );
  assert.deepEqual(
    splitLines(''),
    [
    ]
  );
});
