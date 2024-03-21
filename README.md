# js-test

Low budget expect-based unit tests. Isolates between invocations and safely contains everything that can go wrong.

# Usage

1. Import and instantiate the `UnitTest` class.
2. Invoke method `test`. Supply a description and callback with an `expect` parameter.
4. Invoke the BDD testing methods of the supplied `expect` object.

```JS
import UnitTest from "js-test";

const myTest = new UnitTest();

const testPromise = myTest.test(expect => {
	expect(2+2).toBe(4);
	expect(2+2).toNotBe(5);
});

testPromise.then(testStatus => {
	if(testStatus)
		console.log("Test passed!");
	else
		console.log("Test failed!");
});
```

# `UnitTest` Class

```JS
new UnitTest();
```

The class `UnitTest` is used to execute tests, organize test settings, and store test logs.

## Instance Methods

### `UnitTest.prototype.test` Method

```JS
test( description: string, testFunction: (expect) => any ): Promise<boolean>
```

Calls the given `testFunction` function and supplies an `expect` function as the input parameter.

Returns a Promise which resolves to a boolean which indicates if the test passed or failed.

`expect` returns a new `Expectation` class instance. (See [Expectation Class](#expectation-class)).

Here is an example of a valid `testFunction`:

```JS
function(expect) {
	expect(anyValue).toBe(anyValue);
}
```

## Instance Properties

### `history` Property
- Type `string[][]`

The `history` property contains logs of past tests. Is an Array which contains Arrays of strings.

### `emit` Property
- Type `boolean`
- *Default = `true`*

The `emit` property is a boolean which ndicates if test progress and results should be logged to console.

# Expectation Class

```JS
new Expectation(anyValue: any);
```

The test callback is supplied with an `expect` factory function which returns an `Expectation` instance.

## Instance Properties

### `actualValue` Property

- Type: `any`
 
The value given to `expect`, regarded as the "actual data" and not the expected data.

## Instance Methods

Each of the following methods throws an `ExpectError` when its condition fails:

Method|Expect Input|Method Input|Condition Description
---|---|---|---
`toBe`|any|any|Passes based on the expected value being strictly equivalent to the given value.
`toNotBe`|any|any|Opposite of `toBe`. Passes based on the expected value being strictly equivalent to the given value.
`toReturn`|Function|any|Passes based on the expected function return value being strictly equivalent to the given value.
`toNotReturn`|Function|any|Opposite of `toReturn`. Passes based on the expected function not returning the given value, or none at all.
`toThrow`|Function|any|Passes based on the expected function throwing an instance of the given error, or at all.
`toNotThrow`|Function|any|Opposite of `toThrow`. Passes based on the expected function not throwing an instance of the given error, or none at all.