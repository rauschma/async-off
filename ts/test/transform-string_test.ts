import * as assert from 'assert/strict';
import { transformString } from '../src/transform-string.js';
import { dedent } from '../src/util.js';

suite('transform-string_test.ts');

test('Complex example', () => {
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


test('Async arrow function', () => {
  const input = dedent(`
    const twiceAsync = async (x) => x + x;
  `);

  const output = dedent(`
    const twiceAsync = (x) => x + x;
  `);
  assert.equal(transformString(input).trim(), output);
});

test('Async function expression', () => {
  const input = dedent(`
    const twiceAsync = async function (x) {return x + x};
  `);

  const output = dedent(`
    const twiceAsync = function (x) {return x + x};
  `);
  assert.equal(transformString(input).trim(), output);
});

test('Renaming a property access expression', () => {
  const input = dedent(`
    await assert.rejects(
      async () => null.someProp,
      TypeError
    );

    //<async-off-config>
    // {
    //   "renameVariable": {
    //     "assert.rejects": "assert.throws"
    //   }
    // }
    //</async-off-config>
  `);

  const output = dedent(`
    assert.throws(
      () => null.someProp,
      TypeError
    );
  `);
  assert.equal(transformString(input).trim(), output);
});

test('Rename a variable with a property access', () => {
  const input = dedent(`
    test('Using map()', async () => {
      assert.deepEqual(
        await toArray(AsyncIterable.map(x => x + x, fi(['a', 'b', 'c']))),
        ['aa', 'bb', 'cc']
      );
    });
  
    //<async-off-config>
    // {
    //   "renameVariable": {
    //     "AsyncIterable": "Iterable"
    //   },
    //   "unwrapFunctionCall": [
    //     "fi"
    //   ]
    // }
    //</async-off-config>
  `);

  const output = dedent(`
    test('Using map()', () => {
      assert.deepEqual(
        toArray(Iterable.map(x => x + x, ['a', 'b', 'c'])),
        ['aa', 'bb', 'cc']
      );
    });
  `);
  assert.equal(transformString(input).trim(), output);
});
