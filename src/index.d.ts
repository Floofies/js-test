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
export default class UnitTest {
	history: string[][];
	emit: boolean;
	test(description: string, testFunction: TestFunction): Promise<boolean>
}