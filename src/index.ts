type TestFunction = (expect: (anyValue: any) => Expectation) => any;

function createExpectation(expectQueue: Function[]) {
	return (anyValue: any) => new Expectation(expectQueue, anyValue);
}

export default class UnitTest {
	// Logs from past tests:
	history: string[][] = [];
	// A boolean which indicates if the tests should emit logs to console:
	emit: boolean = true;

	async test(description: string, testFunction: TestFunction): Promise<boolean> {
		// Queue of expectation callbacks which are ready to be executed:
		const expectQueue: Function[] = [];
		// A boolean which indicates if the test failed:
		let caughtError = false;
		// Human-readable logs from the test:
		const testLog = [`Test "${description}":`, `\tƒ Test started ${(new Date()).toISOString()} . . .`];
		// The precise time the test started at:
		const startTime = performance.now();

		// Attempt to execute the test callback to populate the expectation queue:
		try {
			await testFunction(createExpectation(expectQueue));
			if (expectQueue.length === 0) {
				testLog.push("\t? Test FAILED: No expectations were defined!");
				caughtError = true;
			}
		} catch (error) {
			const totalTime = (performance.now() - startTime).toFixed(3);
			testLog.push(`\tX Test FAILED in ${totalTime}ms: ${error}\n\t\t${error.stack.replaceAll("    ", "\t\t  ")}`);
			caughtError = true;
		}

		// The test can't continue if the test callback threw an error:
		if (caughtError)
			return false;

		let totalExp = 0;

		// Attempt to execute the queue of expectations:
		for (const expectation of expectQueue) {
			try {
				totalExp++;
				await expectation();
			} catch (error) {
				testLog.push(`\tX Expectation #${totalExp} FAIL: ${error.toString()}`);
				caughtError = true;
			}
		}

		// Indicate if the test failed or passed:
		const totalTime = (performance.now() - startTime).toFixed(3);
		if (caughtError)
			testLog.push(`\tX Test FAILED in ${totalTime}ms`);
		else
			testLog.push(`\t✓ Test PASSED in ${totalTime}ms`);

		// Emit console messages if enabled:
		if (this.emit)
			console.log(testLog.join("\n") + "\n");

		// Save history of the test:
		this.history.push(testLog);

		return !caughtError;
	}
}

class ExpectError extends Error {
	constructor(expectType: string, message: string) {
		super(message);
		this.name = `expect.${expectType}`;
	}
};

class Expectation {
	actualValue: any;
	expectQueue: Function[];

	constructor(expectQueue: Function[], anyValue: any) {
		this.actualValue = anyValue;
		this.expectQueue = expectQueue;
	}

	toBe(expectedValue: any) {
		this.expectQueue.push(() => {
			if (expectedValue !== this.actualValue)
				throw new ExpectError("toBe", `Expected value "${expectedValue}" but received value "${this.actualValue}" instead.`);
		});
	}
	toNotBe(expectedValue: any) {
		this.expectQueue.push(() => {
			if (expectedValue === this.actualValue)
				throw new ExpectError("toNotBe", `Expected value to not be "${expectedValue}".`);
		});
	}

	toReturn(expectedValue: any) {
		this.expectQueue.push(async () => {
			if ((typeof this.actualValue) !== "function")
				throw new ExpectError("toReturn", `Expected function but received value "${this.actualValue}" instead.`)
			this.actualValue = await this.actualValue();
			if (expectedValue !== this.actualValue)
				throw new ExpectError("toReturn", `Expected return value to be "${expectedValue}".`);
		});
	}
	toNotReturn(expectedValue: any) {
		this.expectQueue.push(async () => {
			if ((typeof this.actualValue) !== "function")
				throw new ExpectError("toNotReturn", `Expected function but received value "${this.actualValue}" instead.`)
			this.actualValue = await this.actualValue();
			if (expectedValue === this.actualValue)
				throw new ExpectError("toNotReturn", `Expected return value to not be "${expectedValue}".`);
		});
	}

	toThrow(expectedError: any = null) {
		this.expectQueue.push(async () => {
			if ((typeof this.actualValue) !== "function")
				throw new ExpectError("toThrow", `Expected function but received value "${this.actualValue}" instead.`);
			try {
				await this.actualValue();
				if (expectedError !== null)
					throw new ExpectError("toThrow", `Expected error ${expectedError} to be thrown.`);
				else
					throw new ExpectError("toThrow", `Expected an error to be thrown.`);
			} catch (thrownError) {
				if (expectedError !== null && !(thrownError instanceof expectedError))
					throw new ExpectError("toThrow", `Expected error ${expectedError} to be thrown, but received "${thrownError}" instead.`);
			}
		});
	}
	toNotThrow(expectedError: any = null) {
		this.expectQueue.push(async () => {
			if ((typeof this.actualValue) !== "function")
				throw new ExpectError("toNotThrow", `Expected function but received value "${this.actualValue}" instead.`);
			try {
				await this.actualValue();
			} catch (thrownError) {
				if (expectedError === null)
					throw new ExpectError("toNotThrow", `Expected an error to not be thrown, but received "${thrownError}" instead.`);
				if (thrownError instanceof expectedError)
					throw new ExpectError("toNotThrow", `Expected ${thrownError} to not be thrown.`);
			}
		});
	}
}