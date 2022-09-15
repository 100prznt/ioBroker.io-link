var test = '1223';

console.log(test);

const DeviceSpec = require('../devicespec.js')

let dummySpec = new DeviceSpec()

dummySpec.deviceSpecName = "hallo";

const json = require('../devices/device-spec.json'); //(with path)


var spec2 = DeviceSpec.from(json);

spec2.processDataIn.forEach(pdi => {
    let sc = pdi.stateConfiguration;
    if (sc.generateChannel == true) {
        console.log(sc.name);
    }
});

//var fu2 = spec2.processDataIn.forEach(myFunc);

if (Array.isArray(spec2.supportedDeviceIds))
spec2.supportedDeviceIds.forEach(vendor => {
    console.log('vendorId: ' + vendor.vendorId);
    vendor.deviceIds.forEach(id => {
        console.log('id: ' + id);
    });
});

spec2.processDataIn.forEach((/** @type {{ name: string; minValue: string; maxValue: string; bitOffset: string; bitWidth: string; encoding: string; stateConfiguration: { name: string; unit: string; type: string; role: string; scalingFactor: string; scalingOffset: string; generateValue: string; generateStatus: string; generateChannel: string; }; states: any[]; }} */ item) => {
    console.log('name: ' + item.name);
    console.log('minValue: ' + item.minValue);
    console.log('maxValue: ' + item.maxValue);
    console.log('bitOffset: ' + item.bitOffset);
    console.log('bitWidth: ' + item.bitWidth);
    console.log('encoding: ' + item.encoding);
    console.log('stateConfiguration name: ' + item.stateConfiguration.name);
    console.log('stateConfiguration unit: ' + item.stateConfiguration.unit);
    console.log('stateConfiguration type: ' + item.stateConfiguration.type);
    console.log('stateConfiguration role: ' + item.stateConfiguration.role);
    console.log('stateConfiguration scalingFactor: ' + item.stateConfiguration.scalingFactor);
    console.log('stateConfiguration scalingOffset: ' + item.stateConfiguration.scalingOffset);
    console.log('stateConfiguration generateValue: ' + item.stateConfiguration.generateValue);
    console.log('stateConfiguration generateStatus: ' + item.stateConfiguration.generateStatus);
    console.log('stateConfiguration generateChannel: ' + item.stateConfiguration.generateChannel);
    
    if (Array.isArray(item.states)) {
        item.states.forEach(item => {
            console.log('states state: ' + item.state);
            console.log('states value: ' + item.value);
        });
    }
});