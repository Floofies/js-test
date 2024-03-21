type ExpectMethod = (expectedValue: any) => void;
interface Expectation {
	toBe: ExpectMethod,
	toNotBe: ExpectMethod,
	toReturn: ExpectMethod,
	toNotReturn: ExpectMethod,
	toThrow: ExpectMethod,
	toNotThrow: ExpectMethod
}
type TestFunction = (expect: (actualValue: any) => Expectation) => any;

//TODO: JSDoc
export default interface UnitTest {
	/** Logs from past tests. */
	history: string[][],
	/** A boolean which indicates if the tests should emit logs to console. */
	emit: boolean,

	/**
	* Creates a new test and immediately queues it for later execution.
	* @param {string} description A string to describe the test in logs.
	* @param {TestFunction} [testFunction] A testing function with an `expect` function as the input parameter.
	*/
	queueTest(description: string, testFunction: TestFunction): void,

	/**
	* Executes any tests which were queued via `queueTest`.
	* @param {boolean} [dequeue=true] A boolean which indicates if the test queue should be deleted after executing.
	* @returns {Promise<boolean>[]} An array of promises which resolve to booleans which indicate if the tests passed or failed.
	*/
	runTests(dequeue?: boolean): Promise<boolean>[],

	/**
	* Creates a new test and immediately executes it.
	* @param {string} description A string to describe the test in logs.
	* @param {TestFunction} [testFunction] A testing function with an `expect` function as the input parameter.
	* @returns {Promise<boolean>} An promise which resolves to a boolean which indicates if the test passed or failed.
	*/
	test(description: string, testFunction: TestFunction): Promise<boolean>
}