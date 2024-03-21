# Guide For Contributors

To contribute to or otherwise change the js-test project, you need [NPM](https://www.npmjs.com/) and to run the two included NPM scripts, `build` and `test`.

Always run the unit test script prior to submitting a pull request, and ensure that your test outputs "OK" at the end.

## Build Script

Execute shell command `npm run build` from the project directory to invoke the TypeScript compiler and save compiled JavaScript files to the `dist` directory.

## Unit Test Script

Execute shell command `npm run test` from the project directory to execute compiled unit tests in `dist/test.js`.

Here is an example of a *successful* unit test run:

```
js-test: 19 tests total.
js-test: 10 unit tests passed successfully.
js-test: 9 unit tests failed.
js-test: OK
```

Here is an example of a *failed* unit test run:

```
js-test: 19 tests total.
js-test: 10 unit tests passed successfully.
js-test: 9 unit tests failed.
js-test: Test #15 failed when it was expected to pass!
js-test: FAIL
```

### How To Add Unit Tests

Add unit tests to `src/test.ts`.

Use the provided `addTest` function to track success/failure as much as possible.

`addTest` expects up to two parameters:

1. A promise from `UnitTest.prototype.test` or similar. The promise should resolve to a boolean which indicates if the test passed or not.
2. A boolean which, if set to `true`, causes the test to pass instead of fail, and vice versa.