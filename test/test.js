var test = '1223';

console.log(test);

const DeviceSpec = require('../devicespec.js')

let dummySpec = new DeviceSpec()

dummySpec.deviceSpecName = "hallo";

const json = require('../devices/device-spec.json'); //(with path)


var spec2 = DeviceSpec.from(json);

var fu2 = spec2.processDataIn.forEach(myFunc);

//console.log(spec2);

function myFunc(item) {
    console.log(item.name);
}