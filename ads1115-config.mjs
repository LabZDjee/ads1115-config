/* jshint esversion: 6 */

// from an object make of (key, value) pairs
// build an object made of reciprocal (value, key)
function reciprocalObject(inObject) {
  const outObject = {};
  for (let k of Object.keys(inObject)) {
    outObject[inObject[k]] = k;
  }
  return outObject;
}

const startConversionMap = {
  doNothing: 0,
  startConversion: 1,
};
let startConversionMapToSymbol;
function getStartConversionTokenFromValue(val) {
  if (startConversionMapToSymbol === undefined) {
    startConversionMapToSymbol = reciprocalObject(startConversionMap);
  }
  return startConversionMapToSymbol[val];
}

const inputMultiplexerMap = {
  in0in1: 0,
  in0in3: 1,
  in1in3: 2,
  in2in3: 3,
  in0gnd: 4,
  in1gnd: 5,
  in2gnd: 6,
  in3gnd: 7,
};
let inputMultiplexerMapToSymbol;
function getInputMultiplexerTokenFromValue(val) {
  if (inputMultiplexerMapToSymbol === undefined) {
    inputMultiplexerMapToSymbol = reciprocalObject(inputMultiplexerMap);
  }
  return inputMultiplexerMapToSymbol[val];
}

const programmableGainAmplifierMap = {
  "6.144": 0,
  "4.096": 1,
  "2.048": 2,
  "1.024": 3,
  "0.512": 4,
  "0.256": 5,
  "0.256_2": 6,
  "0.256_3": 7,
};
let programmableGainAmplifierMapToSymbol;
function getProgrammableGainTokenFromValue(val) {
  if (programmableGainAmplifierMapToSymbol === undefined) {
    programmableGainAmplifierMapToSymbol = reciprocalObject(programmableGainAmplifierMap);
  }
  return programmableGainAmplifierMapToSymbol[val];
}

const operatingModeMap = {
  continuousConversion: 0,
  singleShot: 1,
};
let operatingModeMapToSymbol;
function getOperatingModesTokenFromValue(val) {
  if (operatingModeMapToSymbol === undefined) {
    operatingModeMapToSymbol = reciprocalObject(operatingModeMap);
  }
  return operatingModeMapToSymbol[val];
}

const dataRateMap = {
  "8SPS": 0,
  "16SPS": 1,
  "32SPS": 2,
  "64SPS": 3,
  "128SPS": 4,
  "250SPS": 5,
  "475SPS": 6,
  "860SPS": 7,
};
let dataRateMapToSymbol;
function getDataRateTokenFromValue(val) {
  if (dataRateMapToSymbol === undefined) {
    dataRateMapToSymbol = reciprocalObject(dataRateMap);
  }
  return dataRateMapToSymbol[val];
}

const comparatorModeMap = {
  traditional: 0,
  window: 1,
};
let comparatorModeMapToSymbol;
function getComparatorModeTokenFromValue(val) {
  if (comparatorModeMapToSymbol === undefined) {
    comparatorModeMapToSymbol = reciprocalObject(comparatorModeMap);
  }
  return comparatorModeMapToSymbol[val];
}

const comparatorPolarityMap = {
  activeLow: 0,
  activeHigh: 1,
};
let comparatorPolarityMapToSymbol;
function getComparatorPolarityTokenFromValue(val) {
  if (comparatorPolarityMapToSymbol === undefined) {
    comparatorPolarityMapToSymbol = reciprocalObject(comparatorPolarityMap);
  }
  return comparatorPolarityMapToSymbol[val];
}

const comparatorLatchingMap = {
  nonLatching: 0,
  latching: 1,
};
let comparatorLatchingMapToSymbol;
function getComparatorLatchingTokenFromValue(val) {
  if (comparatorLatchingMapToSymbol === undefined) {
    comparatorLatchingMapToSymbol = reciprocalObject(comparatorLatchingMap);
  }
  return comparatorLatchingMapToSymbol[val];
}

const comparatorQueueMap = {
  assertAfterOneConversion: 0,
  assertAfterTwoConversions: 1,
  assertAfterFourConversions: 2,
  disabled: 3,
};
let comparatorQueueMapToSymbol;
function getComparatorQueueTokenFromValue(val) {
  if (comparatorQueueMapToSymbol === undefined) {
    comparatorQueueMapToSymbol = reciprocalObject(comparatorQueueMap);
  }
  return comparatorQueueMapToSymbol[val];
}

const defaultConfiguration = {
  startConversion: "doNothing",
  inputMultiplexer: "in0in1",
  programmableGainAmplifier: "2.048",
  operatingMode: "singleShot",
  dataRate: "128SPS",
  comparatorMode: "traditional",
  comparatorPolarity: "activeLow",
  comparatorLatching: "nonLatching",
  comparatorQueue: "disabled",
};

const configRegMaps = {
  startConversion: startConversionMap,
  inputMultiplexer: inputMultiplexerMap,
  programmableGainAmplifier: programmableGainAmplifierMap,
  operatingMode: operatingModeMap,
  dataRate: dataRateMap,
  comparatorMode: comparatorModeMap,
  comparatorPolarity: comparatorPolarityMap,
  comparatorLatching: comparatorLatchingMap,
  comparatorQueue: comparatorQueueMap,
};

const configRegSymbolFromValueFunctions = {
  startConversion: getStartConversionTokenFromValue,
  inputMultiplexer: getInputMultiplexerTokenFromValue,
  programmableGainAmplifier: getProgrammableGainTokenFromValue,
  operatingMode: getOperatingModesTokenFromValue,
  dataRate: getDataRateTokenFromValue,
  comparatorMode: getComparatorModeTokenFromValue,
  comparatorPolarity: getComparatorPolarityTokenFromValue,
  comparatorLatching: getComparatorLatchingTokenFromValue,
  comparatorQueue: getComparatorQueueTokenFromValue,
};

function checkConfigurationObject(parameter) {
  let configurationObject = parameter.configurationObject;
  let checkValuesAlso = false;
  if (configurationObject) {
    checkValuesAlso = parameter.checkValues ? true : false;
  } else {
    configurationObject = parameter;
  }
  for (let k of Object.keys(configurationObject)) {
    if (configRegMaps[k] === undefined) {
      return { field: k };
    }
  }
  if (checkValuesAlso) {
    for (let k of Object.keys(configurationObject)) {
      const v = configurationObject[k];
      const error = { field: k, value: v };
      if (typeof v === "number") {
        if (configRegSymbolFromValueFunctions[k](v) === undefined) {
          return error;
        }
      } else {
        if (configRegMaps[k][v] === undefined) {
          return error;
        }
      }
    }
  }
  return true;
}

function alterConfigurationObject(listOfSymbols, originObject) {
  if (checkConfigurationObject({ configurationObject: originObject, checkValuesAlso: true }) !== true) {
    throw new Error("alterConfigurationObject: originObject: is not a configuration object");
  }
  if (Array.isArray(listOfSymbols) === false) {
    throw new Error("alterConfigurationObject: listOfSymbols: expect an array");
  }
  listOfSymbols.forEach(function(symbol) {
    let notFound = true;
    for (let field of Object.keys(configRegMaps)) {
      for (let symbolCandidate of Object.keys(configRegMaps[field])) {
        if (symbol === symbolCandidate) {
          originObject[field] = symbolCandidate;
          notFound = false;
          break;
        }
      }
      if (notFound === false) {
        break;
      }
    }
    if (notFound) {
      throw new Error(`alterConfigurationObject: '${symbol}' not found`);
    }
  });
  return originObject;
}

function cloneDefaultObject(originObject) {
  if (originObject === undefined) {
    originObject = defaultConfiguration;
  }
  return Object.assign({}, originObject);
}

function buildConfigRegister(configurationObject, strict) {
  let lowByte = 0;
  let highByte = 0;
  function getValue(key, shifts, width) {
    let result;
    const val = configurationObject[key];
    if (val === undefined) {
      result = configRegMaps[key][defaultConfiguration[key]];
    } else if (typeof val === "number") {
      result = val;
    } else {
      result = configRegMaps[key][val];
    }
    return (result & ((1 << width) - 1)) << shifts;
  }
  if (strict) {
    const check = checkConfigurationObject({ configurationObject, checkValues: true });
    if (check !== true) {
      const errorDetails =
        check.value === undefined
          ? `wrong field: '${check.field}'`
          : `wrong value for field '${check.field}': '${check.value}'`;
      throw new Error(`ads1115-config:buildConfigRegister: invalid object: ${errorDetails}`);
    }
  }
  highByte |= getValue("startConversion", 7, 1);
  highByte |= getValue("inputMultiplexer", 4, 3);
  highByte |= getValue("programmableGainAmplifier", 1, 3);
  highByte |= getValue("operatingMode", 0, 1);
  lowByte |= getValue("dataRate", 5, 3);
  lowByte |= getValue("comparatorMode", 4, 1);
  lowByte |= getValue("comparatorPolarity", 3, 1);
  lowByte |= getValue("comparatorLatching", 2, 1);
  lowByte |= getValue("comparatorQueue", 0, 2);
  return { highByte, lowByte };
}

function splitConfigRegisterAsValues(hlBytes) {
  let { highByte, lowByte } = hlBytes;
  let result = {};
  function extractBits(value, shift, width) {
    return (value >> shift) & ((1 << width) - 1);
  }
  if (highByte === undefined) {
    highByte = 0x05;
  }
  if (lowByte === undefined) {
    lowByte = 0x83;
  }
  result.startConversion = extractBits(highByte, 7, 1);
  result.inputMultiplexer = extractBits(highByte, 4, 3);
  result.programmableGainAmplifier = extractBits(highByte, 1, 3);
  result.operatingMode = extractBits(highByte, 0, 1);
  result.dataRate = extractBits(lowByte, 5, 3);
  result.comparatorMode = extractBits(lowByte, 4, 1);
  result.comparatorPolarity = extractBits(lowByte, 3, 1);
  result.comparatorLatching = extractBits(lowByte, 2, 1);
  result.comparatorQueue = extractBits(lowByte, 0, 2);
  return result;
}

function splitConfigRegisterAsSymbols(hlBytes) {
  const asInts = splitConfigRegisterAsValues(hlBytes);
  let result = {};
  for (let field of Object.keys(asInts)) {
    const numVal = asInts[field];
    result[field] = configRegSymbolFromValueFunctions[field](numVal);
  }
  return result;
}

function setPointerRegister(whichRegister) {
  switch (whichRegister) {
    case "conv":
    case "conversion":
      return 0;
    case "config":
    case "configuration":
      return 1;
    case "loThresh":
    case "lowThresh":
    case "loThreshold":
    case "lowThreshold":
      return 2;
    case "hiThresh":
    case "highThresh":
    case "hiThreshold":
    case "highThreshold":
      return 3;
  }
  throw new Error(`setPointerRegister: parameter 'whichRegister' set to '${whichRegister}' is invalid`);
}

function setSlaveAddress(addrPin, forReading) {
  if (addrPin !== 0 && addrPin !== 1 && addrPin !== 2 && addrPin !== 3) {
    throw new Error(`setSlaveAddress: parameter 'addrPin' set to '${addrPin}' is invalid (can only be 0, 1, 2, or 3)`);
  }
  return 0x90 + addrPin * 2 + (forReading ? 1 : 0);
}

const configReg = {
  maps: configRegMaps,
  symbolFromValueFunctions: configRegSymbolFromValueFunctions,
  defaultConfiguration,
  cloneDefaultObject,
  checkObject: checkConfigurationObject,
  alterObject: alterConfigurationObject,
  build: buildConfigRegister,
  splitAsValues: splitConfigRegisterAsValues,
  splitAsSymbols: splitConfigRegisterAsSymbols,
};

const addresses = {
  setSlaveAddress,
  setPointerRegister,
};

export { addresses, configReg };
