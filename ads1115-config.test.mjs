/* jshint esversion: 9 */

import { strictEqual, ok, deepEqual } from "assert";
import chai from "chai";

const expect = chai.expect;

import { addresses, configReg } from "./ads1115-config.mjs";

const configurationRegisterBasicChecks = {
  startConversion: ["doNothing", "startConversion"],
  inputMultiplexer: ["in0in1", "in0in3", "in1in3", "in2in3", "in0gnd", "in1gnd", "in2gnd", "in3gnd"],
  programmableGainAmplifier: ["6.144", "4.096", "2.048", "1.024", "0.512", "0.256", "0.256_2", "0.256_3"],
  operatingMode: ["continuousConversion", "singleShot"],
  dataRate: ["8SPS", "16SPS", "32SPS", "64SPS", "128SPS", "250SPS", "475SPS", "860SPS"],
  comparatorMode: ["traditional", "window"],
  comparatorPolarity: ["activeLow", "activeHigh"],
  comparatorLatching: ["nonLatching", "latching"],
  comparatorQueue: ["assertAfterOneConversion", "assertAfterTwoConversions", "assertAfterFourConversions", "disabled"],
};

const configurationRegisterDefaultValues = {
  startConversion: 0,
  inputMultiplexer: 0,
  programmableGainAmplifier: 2,
  operatingMode: 1,
  dataRate: 4,
  comparatorMode: 0,
  comparatorPolarity: 0,
  comparatorLatching: 0,
  comparatorQueue: 3,
};

const objectsToTestForValidity = [
  { obj: { startConversion: "doNothing", inputMultiplexer: 0, programmableGainAmplifier: 2 }, result: true },
  {
    obj: { startConversion: "doNothing", inputMultiplexerXX: 0, programmableGainAmplifier: 2 },
    result: { field: "inputMultiplexerXX" },
    throws: "ads1115-config:buildConfigRegister: invalid object: wrong field: 'inputMultiplexerXX'",
  },
  {
    obj: { startConversion: 0, inputMultiplexer: 0, programmableGainAmplifierYY: 2 },
    result: { field: "programmableGainAmplifierYY" },
    throws: "ads1115-config:buildConfigRegister: invalid object: wrong field: 'programmableGainAmplifierYY'",
  },
  {
    obj: { startConversion: 0, inputMultiplexer: 0, programmableGainAmplifier: 22 },
    result: { field: "programmableGainAmplifier", value: 22 },
    throws:
      "ads1115-config:buildConfigRegister: invalid object: wrong value for field 'programmableGainAmplifier': '22'",
  },
  {
    obj: { startConversion: 0, inputMultiplexer: "strangeSymbol", programmableGainAmplifier: 2 },
    result: { field: "inputMultiplexer", value: "strangeSymbol" },
    throws:
      "ads1115-config:buildConfigRegister: invalid object: wrong value for field 'inputMultiplexer': 'strangeSymbol'",
  },
];

const configObjectsToBuild = [
  { obj: configReg.defaultConfiguration, registerValue: { highByte: 0x05, lowByte: 0x83 } },
  {
    obj: {
      inputMultiplexer: "in0gnd",
      programmableGainAmplifier: "0.256",
      operatingMode: "continuousConversion",
      dataRate: "475SPS",
      comparatorPolarity: "activeHigh",
      comparatorQueue: "assertAfterFourConversions",
    },
    registerValue: { highByte: 0x4a, lowByte: 0xca },
  },
  {
    obj: {},
    registerValue: { highByte: 0x05, lowByte: 0x83 },
  },
  {
    obj: {
      startConversion: "startConversion",
    },
    registerValue: { highByte: 0x85, lowByte: 0x83 },
  },
  {
    obj: {
      startConversion: "startConversion",
      inputMultiplexer: 5,
      programmableGainAmplifier: "0.256_3",
      operatingMode: 0,
      dataRate: "250SPS",
      comparatorMode: 0,
      comparatorPolarity: "activeHigh",
      comparatorLatching: 1,
      comparatorQueue: "assertAfterTwoConversions",
    },
    registerValue: { highByte: 0xde, lowByte: 0xad },
  },
  {
    obj: {
      startConversion: 1,
      inputMultiplexer: "in2in3",
      programmableGainAmplifier: 7,
      operatingMode: "continuousConversion",
      dataRate: 7,
      comparatorMode: "traditional",
      comparatorPolarity: 1,
      comparatorLatching: "latching",
      comparatorQueue: 3,
    },
    registerValue: { highByte: 0xbe, lowByte: 0xef },
  },
];

function normalizeConfigObjectAsNumericValues(cfgObj) {
  const initialCheck = configReg.checkObject({ configurationObject: cfgObj, checkValues: true });
  if (initialCheck !== true) {
    throw new Error(`ads1115-test-config:normalizeConfigObjectAsNumericValues:${JSON.stringify(initialCheck)}`);
  }
  for (let field of Object.keys(cfgObj)) {
    const value = cfgObj[field];
    if (typeof value !== "number") {
      cfgObj[field] = configReg.maps[field][value];
    }
  }
}

function normalizeConfigObjectAsSymbols(cfgObj) {
  const initialCheck = configReg.checkObject({ configurationObject: cfgObj, checkValues: true });
  if (initialCheck !== true) {
    throw new Error(`ads1115-test-config:normalizeConfigObjectAsSymbols:${JSON.stringify(initialCheck)}`);
  }
  for (let field of Object.keys(cfgObj)) {
    const value = cfgObj[field];
    if (typeof value === "number") {
      cfgObj[field] = configReg.symbolFromValueFunctions[field](value);
    }
  }
}

describe("ads111x 'addresses' export", function() {
  const setSlaveAddress = addresses.setSlaveAddress;
  const setPointerRegister = addresses.setPointerRegister;
  describe("check setSlaveAddress", function() {
    [
      { p: [0], r: 144 },
      { p: [0, true], r: 145 },
      { p: [1, false], r: 146 },
      { p: [1, true], r: 147 },
      { p: [2], r: 148 },
      { p: [2, true], r: 149 },
      { p: [3, false], r: 150 },
      { p: [3, true], r: 151 },
    ].forEach(function(testVector) {
      it(`should return value '${testVector.r}' for given parameter '${testVector.p}'`, function() {
        strictEqual(setSlaveAddress(...testVector.p), testVector.r);
      });
    });
    function test(x) {
      return () => {
        setSlaveAddress(x);
      };
    }
    [5, -1, undefined, "hello", null, Math.PI].forEach(function(v) {
      it(`should throw an exception when wrong 'addrPin' parameter set to '${v}'`, function() {
        expect(test(v)).to.throw(
          `setSlaveAddress: parameter 'addrPin' set to '${v}' is invalid (can only be 0, 1, 2, or 3)`
        );
      });
    });
  });
  describe("check setPointerRegister", function() {
    [
      { symbList: ["conv", "conversion"], expected: 0 },
      { symbList: ["config", "configuration"], expected: 1 },
      { symbList: ["loThresh", "lowThresh", "loThreshold", "lowThreshold"], expected: 2 },
      { symbList: ["hiThresh", "highThresh", "hiThreshold", "highThreshold"], expected: 3 },
    ].forEach(function(testVector) {
      testVector.symbList.forEach(function(symbol) {
        it(`it should give value '${testVector.expected} for input '${symbol}'`, function() {
          strictEqual(setPointerRegister(symbol), testVector.expected);
        });
      });
    });
    function test(x) {
      return () => {
        setPointerRegister(x);
      };
    }
    [5, -1, undefined, "hello", null, Math.PI].forEach(function(v) {
      it(`should throw an exception when wrong 'whichRegister' parameter set to '${v}'`, function() {
        expect(test(v)).to.throw(` parameter 'whichRegister' set to '${v}' is invalid`);
      });
    });
  });
});
describe("ads111x configuration register export", function() {
  const cMaps = configReg.maps;
  const valueToSymbol = configReg.symbolFromValueFunctions;
  const defConfig = configReg.defaultConfiguration;
  const checkObject = configReg.checkObject;
  const build = configReg.build;
  describe("preliminary checks", function() {
    it("configReg.maps is a valid configuration object", function() {
      ok(checkObject(cMaps) === true);
    });
    it("configReg.symbolFromValueFunctions is a valid configuration object", function() {
      ok(checkObject(valueToSymbol) === true);
    });
  });
  for (let field of Object.keys(configurationRegisterBasicChecks)) {
    describe(`check ${field}`, function() {
      for (let value = 0; value < configurationRegisterBasicChecks[field].length; value++) {
        const symbol = configurationRegisterBasicChecks[field][value];
        const valueFromMap = cMaps[field][symbol];
        it(`symbol '${symbol}' should be eqal to ${value}:`, function() {
          strictEqual(valueFromMap, value);
        });
        it(`- conversely, ${value} should be eqal to symbol '${symbol}':`, function() {
          strictEqual(symbol, valueToSymbol[field](value));
        });
      }
    });
  }
  describe("check default configuration object", function() {
    it("should be consistent:", function() {
      ok(checkObject({ configurationObject: defConfig, checkValues: true }) === true);
    });
    it("should match values in test vector:", function() {
      for (let field of Object.keys(defConfig)) {
        strictEqual(cMaps[field][defConfig[field]], configurationRegisterDefaultValues[field]);
      }
    });
  });
  describe("test function checkConfigurationObject() [some tests already done here and there with this function]", function() {
    objectsToTestForValidity.forEach(function(testVector, index) {
      it(`should test objectsToTestForValidity[${index}].obj correctly:`, function() {
        deepEqual(checkObject({ configurationObject: testVector.obj, checkValues: true }), testVector.result);
      });
    });
  });
  describe("test how function build() throws an exception when strict parameter set to true", function() {
    objectsToTestForValidity.forEach(function(testVector, index) {
      if (testVector.throws !== undefined) {
        it(`should have build(objectsToTestForValidity[${index}].obj) throw:`, function() {
          const f = () => {
            build(testVector.obj, true);
          };
          expect(f).to.throw(testVector.throws);
        });
      }
    });
  });
  describe("test build() results", function() {
    configObjectsToBuild.forEach(function(testVector, index) {
      it(`should build configObjectsToBuild[${index}].obj correctly:`, function() {
        deepEqual(build(testVector.obj, true), testVector.registerValue);
      });
    });
  });
  describe("test splitAsValues()", function() {
    configObjectsToBuild.forEach(function(testVector, index) {
      const fullObject = { ...defConfig, ...testVector.obj };
      it(`should have function on configObjectsToBuild[${index}].registerValue matching configObjectsToBuild[${index}].obj:`, function() {
        normalizeConfigObjectAsNumericValues(fullObject);
        deepEqual(fullObject, configReg.splitAsValues(testVector.registerValue));
      });
    });
  });
  describe("test spiltAsSymbols()", function() {
    it("should have this function on a void object to bring a default configuration object:", function() {
      deepEqual(defConfig, configReg.splitAsSymbols({}));
    });
    it("should have this function on a non object to also bring a default configuration object:", function() {
      deepEqual(defConfig, configReg.splitAsSymbols(Math.PI));
    });
    it("should have this function on an undefined value to also bring a default configuration object:", function() {
      deepEqual(defConfig, configReg.splitAsSymbols({}));
    });
    configObjectsToBuild.forEach(function(testVector, index) {
      const fullObject = { ...defConfig, ...testVector.obj };
      it(`should have function on configObjectsToBuild[${index}].registerValue matching configObjectsToBuild[${index}].obj:`, function() {
        normalizeConfigObjectAsSymbols(fullObject);
        deepEqual(fullObject, configReg.splitAsSymbols(testVector.registerValue));
      });
    });
  });
});
