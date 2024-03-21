type ExpectValue = (expectedValue: any) => void;
type ExpectFunction = (callback: Function) => any;
interface Expectation {
	toBe: ExpectValue,
	toNotBe: ExpectValue,
	toReturn: ExpectFunction,
	toNotReturn: ExpectFunction,
	toThrow: ExpectFunction,
	toNotThrow: ExpectFunction
}
type TestFunction = (expect: (anyValue: any) => Expectation) => any;

//TODO: JSDoc
export default class UnitTest {
	constructor(description: string, testFunction: TestFunction)
}