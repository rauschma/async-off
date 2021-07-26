# `async-off`: make asynchronous TypeScript code synchronous

## Installation

Using without installation:

```
npx async-off path/to/file.ts
```

Installation:

```
npm install -g async-off
```

## Usage

```
async-off path/to/file.ts
cat path/to/file.ts | async-off

async-off --help
async-off -h
```

`async-off` converts asynchronous TypeScript code to synchronous code by:

* Removing the keyword `await` in expressions and in `for-await-of` loops.
* Removing the keyword `async`.
* Changing `Promise<X>` to `X`.
* Changing `AsyncIterable<X>` to `Iterable<X>` and `AsyncIterator<X>` to `Iterator<X>`.

More changes can be configured (see below).

## What would I use this command for?

`async-off`’s approach only works for very simple code. Then you can avoid writing very similar code twice – once asynchronously and once synchronously. Examples of such code include:

* Helper functions for iterables: `map()`, `filter()`, etc. (see next section)
* A Markdown parser that can be used both asynchronously (with asynchronous iterables as input) and synchronously (with strings or normal iterables as input).

## Example

Input:

```ts
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
```

Output:

```ts
function* map<In, Out>(
  mapperFn: (x: In) => Out,
  iterable: Iterable<In>
): Iterable<Out> {
  for (const x of iterable) {
    yield mapperFn(x);
  }
}
```

## Configuration

`async-off` is configured via embedded JSON (see previous section). The following properties are supported:

```ts
interface ConfigJson {
  /**
   * Removes a function call wrapped around a value.
   * Use case – unit testing:
   * 
   * ```ts
   * processAsyncData(toAsyncIterable(['a', 'b', 'c']));
   * processSyncData(['a', 'b', 'c']);
   * ```
   * 
   * Note: (processAsyncData() is renamed separately.)
   */
  unwrapFunctionCall?: Array<string>;
  /**
   * Included by default: `"Promise"`
   */
  unwrapParamerizedType?: Array<string>;
  renameVariable?: Record<string, string>;
  /**
   * Included by default: `{"AsyncIterable": "Iterable", "AsyncIterator": "Iterator"}`
   */
  renameType?: Record<string, string>;
}
```

## Tips

### Different names for exports

```ts
const Functions = {
  map,
  filter,
};

//<async>
export {Functions as AsyncIterable};
//</async>

//<sync>
// export {Functions as Iterable};
//</sync>
```

## Resources

* For syntax transformations, `async-off` uses the library [`ts-morph`](https://github.com/dsherret/ts-morph)
  * The [TypeScript AST Viewer](https://ts-ast-viewer.com/) helps with exploring how TypeScript code is represented as abstract syntax trees.
