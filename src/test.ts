#!/usr/bin/env node
import UnitTest from "./index.js";

const jsTest = new UnitTest();

// Tracks success/failure of the tests
const testPromises: Promise<void>[] = [];
function addTest(testPromise: Promise<boolean>, shouldFail: boolean = false): void {
	testPromises.push(testPromise.then(status => {
		if (status && shouldFail)
			throw new Error("Test passed when it was expected to fail!");
		else if (!status && !shouldFail)
			throw new Error("Test failed when it was expected to pass!");
	}));
}

addTest(jsTest.test("unitTest should fail if no expectations were supplied", expect => {
	// Nothing
}), true);

addTest(jsTest.test("expect.toBe() should pass when expected", expect => {
	expect(true).toBe(true);
	const obj = {};
	expect(obj).toBe(obj);
}));

addTest(jsTest.test("expect.toBe() should fail when expected", expect => {
	expect(true).toBe(false);
	const obj1 = {};
	const obj2 = {};
	expect(obj1).toBe(obj2);
}), true);

addTest(jsTest.test("expect.toNotBe() should pass when expected", expect => {
	expect(true).toNotBe(false);
	const obj1 = {};
	const obj2 = {};
	expect(obj1).toNotBe(obj2);
}));

addTest(jsTest.test("expect.toNotBe() should fail when expected", expect => {
	expect(true).toNotBe(true);
	const obj = {};
	expect(obj).toNotBe(obj);
}), true);

addTest(jsTest.test("expect.toReturn() should pass when expected", expect => {
	function testFunction() {
		return "foobar";
	}
	expect(testFunction).toReturn("foobar");
}));

addTest(jsTest.test("expect.toReturn() should fail when expected", expect => {
	function testFunction() {
		return "foobar";
	}
	expect(testFunction).toReturn("baz");
}), true);

addTest(jsTest.test("expect.toNotReturn() should pass when expected", expect => {
	function testFunction() {
		return "foobar";
	}
	expect(testFunction).toNotReturn("baz");
}));

addTest(jsTest.test("expect.toNotReturn() should fail when expected", expect => {
	function testFunction() {
		return "foobar";
	}
	expect(testFunction).toNotReturn("foobar");
}), true);

addTest(jsTest.test("expect.toThrow() should pass when expected", expect => {
	class TestError extends Error { }
	function testFunction() {
		throw new TestError("Test Error");
	}
	expect(testFunction).toThrow();
	expect(testFunction).toThrow(TestError);
}));

addTest(jsTest.test("expect.toThrow() should fail when expected", expect => {
	class TestError1 extends Error { }
	class TestError2 extends Error { }
	function testFunction() {
		throw new TestError1("Test Error");
	}
	function testFunction2() {
		return "foobar";
	}
	expect(testFunction2).toThrow();
	expect(testFunction).toThrow(TestError2);
}), true);

addTest(jsTest.test("expect.toNotThrow() should pass when expected", expect => {
	class TestError1 extends Error { }
	class TestError2 extends Error { }
	function testFunction() {
		throw new TestError1("Test Error");
	}
	function testFunction2() {
		return "foobar";
	}
	expect(testFunction2).toNotThrow();
	expect(testFunction).toNotThrow(TestError2);
}));

addTest(jsTest.test("expect.toNotThrow() should fail when expected", expect => {
	class TestError extends Error { }
	function testFunction() {
		throw new TestError("Test Error");
	}
	expect(testFunction).toNotThrow();
	expect(testFunction).toNotThrow(TestError);
}), true);

Promise.all(testPromises).then(() => {
	console.log(`✓✓✓ ${testPromises.length} unit tests passed successfully ✓✓✓`);
})