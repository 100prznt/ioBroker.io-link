class DeviceSpec {
    deviceSpecName = '';
    deviceClass = '';
    supportedDeviceIds = new VendorDevices();
    processDataIn = new Array();


    constructor() {

    }

    
    static from(json) {
        //usage: const myDeviceSpec = DeviceSpec.from({ data: "whatever" });
        return Object.assign(new DeviceSpec(), json);
    }


  }

  module.exports = DeviceSpec;

class VendorDevices {
  vendorId = Number.NaN;
  deviceIds = new Array();
}

class ProcessDataIn {
    name = '';
    minValue = Number.NaN;
    maxValue = Number.NaN;
    states = new State();
    bitWidth = Number.NaN;
    bitOffset = Number.NaN;
    encodeing = '';
    stateConfiguration = new StateConfiguration();
}

class State {
    name = '';
    value = Number.NaN;
    state = '';
}

class StateConfiguration {
    name = '';
    unit = '';
    type = 'string'
    role = 'value';
    scalingFactor = Number.NaN;
    scalingOffset = Number.NaN;
    generateValue = false;
    generateStatus = false;
    generateChannel = false;
}
  