class ExpectError extends Error {
	constructor(expectType: string, message: string) {
		super(message);
		this.name = `expect.${expectType}`;
	}
};

export default class Expectation {
	// The actual value that was given
	actualValue: any;
	// A callback function to invoke with the expectation method
	callback: Function;

	constructor(callback: Function, anyValue: any) {
		this.actualValue = anyValue;
		this.callback = callback;
	}

	/** Creates a factory function */
	static create(callback: Function) {
		return (anyValue: any) => new Expectation(callback, anyValue);
	}

	// Strict equivalence of any two values
	toBe(expectedValue: any) {
		this.callback(() => {
			if (expectedValue !== this.actualValue)
				throw new ExpectError("toBe", `Expected value "${expectedValue}" but received value "${this.actualValue}" instead.`);
		});
	}
	toNotBe(expectedValue: any) {
		this.callback(() => {
			if (expectedValue === this.actualValue)
				throw new ExpectError("toNotBe", `Expected value to not be "${expectedValue}".`);
		});
	}

	// Strict equivalence of a function's return value and a value
	toReturn(expectedValue: any) {
		this.callback(async () => {
			if ((typeof this.actualValue) !== "function")
				throw new ExpectError("toReturn", `Expected function but received value "${this.actualValue}" instead.`)
			this.actualValue = await this.actualValue();
			if (expectedValue !== this.actualValue)
				throw new ExpectError("toReturn", `Expected return value to be "${expectedValue}".`);
		});
	}
	toNotReturn(expectedValue: any) {
		this.callback(async () => {
			if ((typeof this.actualValue) !== "function")
				throw new ExpectError("toNotReturn", `Expected function but received value "${this.actualValue}" instead.`)
			this.actualValue = await this.actualValue();
			if (expectedValue === this.actualValue)
				throw new ExpectError("toNotReturn", `Expected return value to not be "${expectedValue}".`);
		});
	}

	// Expect an error or specific type of error to be thrown
	toThrow(expectedError: any = null) {
		this.callback(async () => {
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
	// Expect an error to not be thrown
	toNotThrow(expectedError: any = null) {
		this.callback(async () => {
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