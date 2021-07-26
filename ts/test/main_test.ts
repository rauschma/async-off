import * as assert from 'assert/strict';
import { transformString } from '../src/transform-string.js';
import { dedent } from '../src/util.js';

suite('main_test.ts');

test('transformString – complex example', () => {
  const input = dedent(`
    async function* map<In, Out>(
      mapperFn: (x: In) => Out,
      iterable: AsyncOrSyncIterable<In>
    ): AsyncIterable<Out> {
      for await (const x of iterable) {
        yield mapperFn(x);
      }
    }

    //<async>
    type AsyncOrSyncIterable<Item> = AsyncIterable<Item> | Iterable<Item>;
    //</async>

    //<async-off-config>
    // {
    //   "renameType": {
    //     "AsyncOrSyncIterable": "Iterable"
    //   }
    // }
    //</async-off-config>
  `);

  const output = dedent(`
    function* map<In, Out>(
      mapperFn: (x: In) => Out,
      iterable: Iterable<In>
    ): Iterable<Out> {
      for (const x of iterable) {
        yield mapperFn(x);
      }
    }
  `);
  assert.equal(transformString(input).trim(), output);
});


test('transformString – async arrow function', () => {
  const input = dedent(`
    const twiceAsync = async (x) => x + x;
  `);

  const output = dedent(`
    const twiceAsync = (x) => x + x;
  `);
  assert.equal(transformString(input).trim(), output);
});

test('transformString – async function expression', () => {
  const input = dedent(`
    const twiceAsync = async function (x) {return x + x};
  `);

  const output = dedent(`
    const twiceAsync = function (x) {return x + x};
  `);
  assert.equal(transformString(input).trim(), output);
});
