import Expectation from "./Expectation.js";

type TestFunction = (expect: (anyValue: any) => Expectation) => any;

export default class UnitTest {
	testQueue: { callback: TestFunction, desc: string }[] = [];
	/** Logs from past tests. */
	history: string[][] = [];
	/** A boolean which indicates if the tests should emit logs to console. */
	emit: boolean = true;

	/**
	* Creates a new test and immediately queues it for later execution.
	* @param {string} description A string to describe the test in logs.
	* @param {Function} [testFunction] A testing function with an `expect` function as the input parameter.
	*/
	queueTest(description: string, testFunction: TestFunction): void {
		this.testQueue.push({
			callback: testFunction,
			desc: description
		});
	}

	/**
	* Executes any tests which were previously queued via `queueTest`.
	* @param {boolean} [dequeue=true] A boolean which indicates if the test queue should be deleted after executing.
	* @returns {Promise<boolean>[]} An array of promises which resolve to booleans which indicate if the tests passed or failed.
	*/
	runTests(dequeue:boolean = true): Promise<boolean>[] {
		const testPromises: Promise<boolean>[] = [];
		for (const test of this.testQueue)
			testPromises.push(this.test(test.desc, test.callback));
		if(dequeue)
			this.testQueue = [];
		return testPromises;
	}

	/**
	* Creates a new test and immediately executes it.
	* @param {string} description A string to describe the test in logs.
	* @param {TestFunction} [testFunction] A testing function with an `expect` function as the input parameter.
	* @returns {Promise<boolean>} An promise which resolves to a boolean which indicates if the test passed or failed.
	*/
	async test(description: string, testFunction: TestFunction): Promise<boolean> {
		// Queue of expectation callbacks which are ready to be executed
		const expectQueue: Function[] = [];
		// A boolean which indicates if the test failed
		let caughtError = false;
		// Human-readable logs from the test
		const testLog = [`Test "${description}":`, `\tƒ Test started ${(new Date()).toISOString()}`];
		// The precise time the test started at
		const startTime = performance.now();

		// Attempt to execute the test callback to populate the expectation queue
		try {
			await testFunction(Expectation.create((expectMethod: Function) => expectQueue.push(expectMethod)));
			// The expectation queue should be populated by now
			if (expectQueue.length === 0) {
				testLog.push("\t? Test FAILED: No expectations were defined!");
				caughtError = true;
			}
		} catch (error) {
			const totalTime = (performance.now() - startTime).toFixed(3);
			testLog.push(`\tX Test FAILED in ${totalTime}ms: ${error}\n\t\t${error.stack.replaceAll("    ", "\t\t  ")}`);
			caughtError = true;
		}

		// The test can't continue if the test callback threw an error
		if (caughtError) {
			// Emit console messages if enabled:
			if (this.emit)
				console.log(testLog.join("\n") + "\n");
			// Save history of the test:
			this.history.push(testLog);
			return false;
		}

		let totalExp = 0;
		// Attempt to execute the queue of expectations
		for (const expectation of expectQueue) {
			totalExp++;
			try {
				await expectation();
			} catch (error) {
				testLog.push(`\tX Expectation #${totalExp} FAIL: ${error.toString()}`);
				caughtError = true;
			}
		}

		// Indicate if the test failed or passed
		const totalTime = (performance.now() - startTime).toFixed(3);
		if (caughtError)
			testLog.push(`\tX Test FAILED in ${totalTime}ms`);
		else
			testLog.push(`\t✓ Test PASSED in ${totalTime}ms`);

		// Emit console messages if enabled
		if (this.emit)
			console.log(testLog.join("\n") + "\n");

		// Save history of the test
		this.history.push(testLog);

		return !caughtError;
	}
}