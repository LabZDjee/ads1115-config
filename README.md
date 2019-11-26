# Purpose

This NPM module provides symbolic definitions and helpers for the Texas Instruments [ADS111x](https://www.ti.com/lit/ds/symlink/ads1115.pdf) I2c Δ-Σ analog-to-digital converters (ADS1113, ADS1114, ADS1115)

IT should be noted that this package has been entirely written in ESM (EcmaScript Modules) of extension `.mjs`: exports are not written in deprecated [CommonJS](https://en.wikipedia.org/wiki/CommonJS) syntax 

## Installation

 `npm install --save @labzdjee/ads1115-config` 

# API in Brief

This API is written in modular ECMAScript and exports two objects: `addresses` and `configReg`  (and no default)

Object `addresses` exports the following functions:

- `setSlaveAddress`: returns value of first byte of an I2c message, known as *slave address byte*
- `setPointerRegister`: returns value of second byte of an I2c message, known as *address pointer register*

Object `configReg` exports the following entities, related to the definition of the *configuration register*:

- `maps`: a low level object whose keys are configuration register fields, contents for each of these keys is itself an object whose keys are field symbolic values associated with their respective numeric values. Example: `configReg.inputMultiplexer.in0gnd` gives `4` 
- `symbolFromValueFunctions`: a low level object which contains a set of functions which essentially is essentially the reciprocal of `maps`. Example: `configReg.inputMultiplexer(4)` gives `"in0gnd"`
- `checkObject`: a function which verifies if an object is a *configuration object*, that is an object with only configuration fields as keys
- `defaultConfiguration`: default *configuration object*
- `buildConfigRegister`: a function which takes a *configuration object* and returns two bytes to be serialized
- `splitAsValues`: a function which takes two bytes representing a configuration register as read on the I2c bus and returns a *configuration object* with values in a *numeric* form 
- `splitAsSymbols`: a function which takes two bytes representing a configuration register as read on the I2c bus and returns a *configuration object* with values in a *symbolic* form 

# Export: `addresses`

## Function `setSlaveAddress`

This function takes two arguments `addrPin` and `forReading` (optional). First is a number between `0` and `3` and should match the slave address pin settings. Second argument if `true` will set the *read* bit. It returns value of first byte of an I2c message, known as *slave address byte*

An incorrect pin number will make the function `throw`

## Function `setPointerRegister`

This function takes a symbolic value and returns  value of second byte of an I2c message, known as *address pointer register*

Accepted symbols are:

- `"conv"`, `"conversion"`
- `"config"`, `"configuration"`
- `"loThresh"`, `"lowThresh"`, `"loThreshold"`, `"lowThreshold"`
- `"hiThresh"`, `"highThresh"`, `"hiThreshold"`, `"highThreshold"`

Any other string will make the function `throw`

# Configuration Register Export: `configReg` 

Definitions and helpers for fields of the *configuration register* are exported as object `configReg`

## Symbolic Names and Values for Configuration Register

This is low level stuff normally not used much, it is exported anyway. However it defines all **symbolic** values (which are case sensitive) for configuration register **fields** (which are also case sensitive) associated to their respective numeric values

Exported sub-object for these maps which takes a field and a *symbolic value* (aka a **symbol**) and provides a *numeric* value: `configReg.maps`

Exported sub-object which bears functions which take a *field* and a *numeric* value and give a *symbol*: `configReg.symbolFromValueFunctions`

Note: *field* keys to these maps are defined for each configuration field in the following sub-sections

Example for field *data rate* as defined below:

- `configReg.maps.dataRate["64SPS"]` gives value `3` and conversely `configReg.symbolFromValueFunctions.dataRate(3)` gives symbol `"64SPS"`

### Operational Status or Single-Conversion Start

*This bit determines the operational status of the device. OS can only be written when in power-down state and has no effect when a conversion is ongoing*

Map key / field name: `startConversion`

Config register field: **OS**

| symbol            | role                                                         | value |
| ----------------- | ------------------------------------------------------------ | ----- |
| `doNothing`       | When writing: do nothing. When reading: device is currently performing a conversion | 0     |
| `startConversion` | When writing: start a single conversion, when in power-down state, When writing: device is not currently performing a conversion | 1     |

Note: as described above, this field has a different meaning when read or written. It has been arbitrary chosen to associate a symbol meaningful when writing. It should be remembered upon reading that `doNothing` means a conversion in under way and `startConversion` means no conversion is currently performed

### Input Multiplexer Configuration

*These bits configure the input multiplexer. These bits serve no function on the ADS1113 and ADS1114*

Map key / field name: `inputMultiplexer`

Config register field: **MUX**

| symbol   | role                        | value |
| -------- | --------------------------- | ----- |
| `in0in1` | AINp= AIN0 and AINn= AIN1   | 0     |
| `in0in3` | AINp = AIN0 and AINn = AIN3 | 1     |
| `in1in3` | AINp = AIN1 and AINn = AIN3 | 2     |
| `in2in3` | AINp = AIN2 and AINn = AIN3 | 3     |
| `in0gnd` | AINp = AIN0 and AINn = GND  | 4     |
| `in1gnd` | AINp = AIN1 and AINn= GND   | 5     |
| `in2gnd` | AINp = AIN2 and AINn= GND   | 6     |
| `in3gnd` | AINp = AIN3 and AINn= GND   | 7     |

### Programmable Gain Amplifier Configuration

*Programmable gain amplifier configuration These bits set the FSR (Full Scale Range) of the programmable gain amplifier. These bits serve no function on the ADS1113*

Map key / field name: `programmableGainAmplifier`

Config register field: **PGA**

| symbol    | role           | value |
| --------- | -------------- | ----- |
| `6.144`   | FSR = ±6.144 V | 0     |
| `4.096`   | FSR = ±4.096 V | 1     |
| `2.048`   | FSR = ±2.048V  | 2     |
| `1.024`   | FSR = ±1.024 V | 3     |
| `0.512`   | FSR = ±0.512 V | 4     |
| `0.256`   | FSR = ±0.256V  | 5     |
| `0.256_2` | FSR = ±0.256V  | 6     |
| `0.256_3` | FSR = ±0.256V  | 7     |

### Device Operating Mode

*This bit controls the operating mode*

Map key / field name: `operatingMode`

Config register field: **MODES**

| symbol                 | role                                 | value |
| ---------------------- | ------------------------------------ | ----- |
| `continuousConversion` | Continuous-conversion mode           | 0     |
| `singleShot`           | Single-shot mode or power-down state | 1     |

### Data Rate

*These bits control the data rate setting*

Map key / field name: `dataRate`

Config register field: **DR**

| symbol   | role              | value |
| -------- | ----------------- | ----- |
| `8SPS`   | 8 SPS (samples/s) | 0     |
| `16SPS`  | 16 SPS            | 1     |
| `32SPS`  | 32 SPS            | 2     |
| `64SPS`  | 64 SPS            | 3     |
| `128SPS` | 128 SPS           | 4     |
| `250SPS` | 250 SPS           | 5     |
| `475SPS` | 475 SPS           | 6     |
| `860SPS` | 860 SPS           | 7     |

### Comparator Mode

*This bit configures the comparator operating mode. This bit serves no function on the ADS1113*

Map key / field name: `comparatorMode`

Config register field: **COMP_MODE**

| symbol        | role                   | value |
| ------------- | ---------------------- | ----- |
| `traditional` | Traditional comparator | 0     |
| `window`      | Window comparator      | 1     |

### Comparator Polarity

*This bit controls the polarity of the ALERT/RDY pin. This bit serves no function on the ADS1113*

Map key / field name: `comparatorPolarity`

Config register field: **COMP_POL**

| symbol       | role        | value |
| ------------ | ----------- | ----- |
| `activeLow`  | Active low  | 0     |
| `activeHigh` | Active high | 1     |

### Latching Comparator

*This bit controls whether the ALERT/RDY pin latches after being asserted or clears after conversions are within the margin of the upper and lower threshold values. This bit serves no function on the ADS1113*

Map key / field name: `comparatorLatching`

Config register field: **COMP_LAT**

| symbol        | role                                                         | value |
| ------------- | ------------------------------------------------------------ | ----- |
| `nonLatching` | Non latching comparator . The ALERT/RDY pin does not latch when asserted | 0     |
| `latching`    | Latching comparator. The asserted ALERT/RDY pin remains latched until conversion data are read by the master or an appropriate SMBus alert response is sent by the master. The device responds with its address, and it is the lowest address currently asserting the ALERT/RDY bus line | 1     |

### Comparator Queue and Disable

*These bits perform two functions. When set to `disabled`, the comparator is disabled and the ALERT/RDY pin is set to a high-impedance state. When set to any other value, the ALERT/RDY pin and the comparator function are enabled, and the set value determines the number of successive conversions exceeding the upper or lower threshold required before asserting the ALERT/RDY pin. These bits serve no function on the ADS1113*

Map key / field name: `comparatorQueue`

Config register field: **COMP_QUE**

| symbol                       | role                                                       | value |
| ---------------------------- | ---------------------------------------------------------- | ----- |
| `assertAfterOneConversion`   | Assert after one conversion                                | 0     |
| `assertAfterTwoConversions`  | Assert after two conversions                               | 1     |
| `assertAfterFourConversions` | Assert after four conversions                              | 2     |
| `disabled`                   | Disable comparator and set ALERT/RDY pin to high-impedance | 3     |

## Concept of Configuration Object

A valid *configuration object* can *only* contain any of the following keys know as *fields* (which described above): `startConversion`,  `inputMultiplexer`, `programmableGainAmplifier`, `operatingMode`, `dataRate`, `comparatorMode`, `comparatorPolarity`, `comparatorLatching`, `comparatorQueue`

Data associated to this fields can be *numeric values* or *symbols* even mixed

### Check for Validity of a Configuration Object

A method tests whether a *configuration object* is valid, as defined above:  `configReg.checkConfigurationObject`

This method activity depends on what type of parameter is passed on:

- simple object: in this case this is the *configuration object* under test and only field names it contains are verified
- composed object: `{configurationObject, checkValues}` this allows for deciding whether or not *values* are also checked depending on the truthiness of attribute `checkValue`

Three types of values are returned:

- `true` if given configuration object passes the test
- an error object of format `{field}` with first wrong field as `field` contents
- an error object of format  `{field, value}` with first wrong value as `value` contents and `field` contents as the corresponding field

 Notes:

- values are verified only after all fields have been verified to be correct
- be careful with returned value: test for strict truth equality (`=== true`) as `if(configReg.checkConfigurationObject(...))` will always succeed (because `if({}`) succeeds)

### Default Configuration Object

Default values for configuration register are defined in a symbolic configuration object: `configReg.defaultConfiguration`

Note: all values are set to their default as stated in the component datasheet and `startConversion` is set to `doNothing`

## Higher Level API

### `configReg.build`

This function takes a *configuration object*, builds and returns a configuration register: `configReg.build(configObject, strict)`

Parameter `strict` will verify whether `configObject` is valid. If not `build` throws an exception with a string which points out what is the (first) problem

Any field not in `configObject` is taken from  `configReg.defaultConfiguration` instead

Returned value is a configuration register, which is an object which consists of two bytes: `{ highByte, lowByte }` which can be directly serialized

### `configReg.splitAsValues`

This is one of the two reciprocal functions to `build`: it takes a configuration register of form `{ highByte, lowByte }` and returns a full *configuration object* whose fields are populated with *numeric* values

In case, `highByte` is not given a default value, corresponding to the default value for the high byte of the configuration register. Same for `lowByte` with default value of the low byte

### `configReg.splitAsSymbols`

Same as previous function except it populates result values with *symbols*