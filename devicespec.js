class DeviceSpec {
    deviceSpecName = '';
    deviceClass = '';
    supportedDeviceIds = new Array();
    processDataIn = new ProcessDataIn();


    constructor() {

    }

    
    static from(json) {
        //usage: const myDeviceSpec = DeviceSpec.from({ data: "whatever" });
        return Object.assign(new DeviceSpec(), json);
    }


  }

  module.exports = DeviceSpec;

  class ProcessDataIn {
    name = '';
    minValue = Number.NaN;
    maxValue = Number.NaN;
    states = new Array();
    bitWidth = Number.NaN;
    bitOffset = Number.NaN;
    encodeing = '';
    stateConfiguration = new StateConfiguration();
  }

  class State {
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
    generateStatus = false;
    generateChannel = false;
  }
  