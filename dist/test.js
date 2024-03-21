#!/usr/bin/env node
import UnitTest from "./index.js";
import Expectation from "./Expectation.js";
// Tracks success/failure of the tests
const testPromises = [];
const testFailures = [];
function addTest(testPromise, shouldFail = false) {
    const testNumber = testPromises.length + 1;
    testPromises.push(testPromise.then(status => {
        if (status && shouldFail) {
            process.exitCode = 1;
            testFailures.push(`js-test: Test #${testNumber} passed when it was expected to fail!`);
        }
        else if (!status && !shouldFail) {
            process.exitCode = 1;
            testFailures.push(`js-test: Test #${testNumber} failed when it was expected to pass!`);
        }
        return status;
    }));
}
console.log("js-test: Starting unit tests . . .\n");
const jsTest = new UnitTest;
addTest(jsTest.test("1. unitTest should fail if no expectations were supplied", expect => {
    // Nothing
}), true);
addTest(jsTest.test("2. expect.toBe() should pass when the actual value matches the expected value", expect => {
    expect(true).toBe(true);
    const obj = {};
    expect(obj).toBe(obj);
}));
addTest(jsTest.test("3. expect.toBe() should fail when the actual value does not match the expected value", expect => {
    expect(true).toBe(false);
    const obj1 = {};
    const obj2 = {};
    expect(obj1).toBe(obj2);
}), true);
addTest(jsTest.test("4. expect.toNotBe() should pass when the actual value does not match the expected value", expect => {
    expect(true).toNotBe(false);
    const obj1 = {};
    const obj2 = {};
    expect(obj1).toNotBe(obj2);
}));
addTest(jsTest.test("5. expect.toNotBe() should fail when the actual value matches the expected value", expect => {
    expect(true).toNotBe(true);
    const obj = {};
    expect(obj).toNotBe(obj);
}), true);
addTest(jsTest.test("6. expect.toReturn() should pass when the returned value matches the expected value", expect => {
    function testFunction() {
        return "foobar";
    }
    expect(testFunction).toReturn("foobar");
}));
addTest(jsTest.test("7. expect.toReturn() should fail when the returned value does not match the expected value", expect => {
    function testFunction() {
        return "foobar";
    }
    expect(testFunction).toReturn("baz");
}), true);
addTest(jsTest.test("8. expect.toNotReturn() should pass when the returned value does not match the expected value", expect => {
    function testFunction() {
        return "foobar";
    }
    expect(testFunction).toNotReturn("baz");
}));
addTest(jsTest.test("9. expect.toNotReturn() should fail when the returned value matches the expected value", expect => {
    function testFunction() {
        return "foobar";
    }
    expect(testFunction).toNotReturn("foobar");
}), true);
addTest(jsTest.test("10. expect.toThrow() should pass when the thrown error matches the expected error", expect => {
    class TestError extends Error {
    }
    function testFunction() {
        throw new TestError("Test Error");
    }
    expect(testFunction).toThrow();
    expect(testFunction).toThrow(TestError);
}));
addTest(jsTest.test("11. expect.toThrow() should fail when the thrown error does not match the expected error", expect => {
    class TestError1 extends Error {
    }
    class TestError2 extends Error {
    }
    function testFunction() {
        throw new TestError1("Test Error");
    }
    function testFunction2() {
        return "foobar";
    }
    expect(testFunction2).toThrow();
    expect(testFunction).toThrow(TestError2);
}), true);
addTest(jsTest.test("12. expect.toNotThrow() should pass when the thrown error does not match the expected error", expect => {
    class TestError1 extends Error {
    }
    class TestError2 extends Error {
    }
    function testFunction() {
        throw new TestError1("Test Error");
    }
    function testFunction2() {
        return "foobar";
    }
    expect(testFunction2).toNotThrow();
    expect(testFunction).toNotThrow(TestError2);
}));
addTest(jsTest.test("13. expect.toNotThrow() should fail when the thrown error matches the expected error", expect => {
    class TestError extends Error {
    }
    function testFunction() {
        throw new TestError("Test Error");
    }
    expect(testFunction).toNotThrow();
    expect(testFunction).toNotThrow(TestError);
}), true);
// Queueing functions
const jsTest2 = new UnitTest;
addTest(jsTest2.queueTest("14. queueTest should pass when expected", expect => {
    expect(true).toBe(true);
}));
addTest(new Promise(resolve => {
    const results = jsTest2.runTests();
    if (Array.isArray(results) && results.length) {
        const promise = results[0];
        promise.then(resolve);
    }
    else {
        resolve(false);
    }
}));
const jsTest3 = new UnitTest;
addTest(jsTest3.queueTest("15. queueTest should fail when expected", expect => {
    expect(true).toBe(false);
}), true);
addTest(new Promise(resolve => {
    const results = jsTest3.runTests();
    if (Array.isArray(results) && results.length) {
        const promise = results[0];
        promise.then(resolve);
    }
    else {
        resolve(false);
    }
}), true);
// Expectation methods should throw errors upon failure
addTest(new Promise(resolve => {
    const cb = function (condition) {
        try {
            condition();
            resolve(false);
        }
        catch (error) {
            resolve(true);
        }
    };
    const expect = new Expectation(cb, "TestValue");
    expect.toBe("Not TestValue");
}));
addTest(new Promise(resolve => {
    const cb = function (condition) {
        try {
            condition();
            resolve(false);
        }
        catch (error) {
            resolve(true);
        }
    };
    const expect = new Expectation(cb, "TestValue");
    expect.toNotBe("TestValue");
}));
Promise.all(testPromises).then((testResults) => {
    const totalPassed = testResults.filter(status => status === true).length;
    const totalFailed = testResults.filter(status => status === false).length;
    console.log(`js-test: ${testPromises.length} tests total.`);
    if (totalPassed > 0)
        console.log(`js-test: ${totalPassed} unit tests passed successfully.`);
    if (totalFailed > 0)
        console.log(`js-test: ${totalFailed} unit tests failed.`);
    if (testFailures.length)
        console.log(testFailures.join("\n"));
    if (!process.exitCode)
        console.log("js-test: OK");
    else
        console.error("js-test: FAIL");
});
