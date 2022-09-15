'use strict';

// The adapter-core module gives you access to the core ioBroker functions
const utils = require('@iobroker/adapter-core');

// you need to create an adapter
const adapter = new utils.Adapter('io-link');

// additional required packackages
const axios = require('axios');

//DeviceSpec class
const DeviceSpec = require('./devicespec.js')

const getPortData = async (/** @type {string} */ endpoint, /** @type {number} */ iolinkport, /** @type {string} */ portschannelpath, /** @type {DeviceSpec | null} */ devicespec) => {
	try {
		//sensor info and process data requests
		let requestSensorComSpeed =		getRequestBody(`/iolinkmaster/port[${iolinkport}]/comspeed/getdata`);
		let requestSensorCycletime =	getRequestBody(`/iolinkmaster/port[${iolinkport}]/mastercycletime_actual/getdata`);

		let requestSensorVendorId =		getRequestBody(`/iolinkmaster/port[${iolinkport}]/iolinkdevice/vendorid/getdata`);
		let requestSensorId =			getRequestBody(`/iolinkmaster/port[${iolinkport}]/iolinkdevice/deviceid/getdata`);
		let requestSensorName =			getRequestBody(`/iolinkmaster/port[${iolinkport}]/iolinkdevice/productname/getdata`);
		let requestDeviceSn =			getRequestBody(`/iolinkmaster/port[${iolinkport}]/iolinkdevice/serial/getdata`);
		let requestSensorStatus =		getRequestBody(`/iolinkmaster/port[${iolinkport}]/iolinkdevice/status/getdata`);
		let requestSensorData =			getRequestBody(`/iolinkmaster/port[${iolinkport}]/iolinkdevice/pdin/getdata`);

		

		let comSpeed = '';
		switch(await getValue(endpoint, requestSensorComSpeed)) {
			case 0:
				comSpeed = 'COM1 (4.8 kBaud)';
				break;
			case 1:
				comSpeed = 'COM2 (38.4 kBaud)';
				break;
			case 2:
				comSpeed = 'COM3 (230.4 kBaud)';
				break;
		}
		let cycletime = await getValue(endpoint, requestSensorCycletime) / 1000;

		//TODO: Abbrechen wenn Port leer
		let vendorid = await getValue(endpoint, requestSensorVendorId);
		let sensorid = await getValue(endpoint, requestSensorId);
		let sensorName = await getValue(endpoint, requestSensorName);
		let serialnumber = await getValue(endpoint, requestDeviceSn);
		let deviceStatus = '';
		switch(await getValue(endpoint, requestSensorStatus)) {
			case 0:
				deviceStatus = 'Not connected';
				break;
			case 1:
				deviceStatus = 'Preoperate';
				break;
			case 2:
				deviceStatus = 'Operate';
				break;
			case 3:
				deviceStatus = 'Communication error';
				break;
		}
		let processdatain = await getValue(endpoint, requestSensorData);


		let idPort = `${portschannelpath}.${iolinkport}`
		let idIoLink = `${idPort}.iolink`;
		let idDevice = `${idPort}.${sensorName}`;
		let idProcessDataIn = `${idDevice}.processdatain`;
		let idInfo = `${idDevice}.info`;


		//Prepare state tree
		generateChannelObject(idPort, `IO-Link Port ${iolinkport}`);
		generateChannelObject(idIoLink, 'IO-Link');
		generateDeviceObject(idDevice, sensorName);
		generateChannelObject(idProcessDataIn, 'Processdata In');
		generateChannelObject(idInfo, `Info`);

		//Write states
		generateStateObject(`${idIoLink}.comspeed`, 'Communication Mode', 'value', 'string', comSpeed);
		generateStateObject(`${idIoLink}.mastercycletime`, 'Master Cycletime', 'value.interval', 'number', cycletime);

		generateStateObject(`${idInfo}.status`, 'Device status', 'info.status', 'string', deviceStatus);
		generateStateObject(`${idInfo}.vendorid`, 'Vendor ID', 'value', 'string', vendorid);
		generateStateObject(`${idInfo}.sensorid`, 'Sensor ID', 'value', 'string', sensorid);
		generateStateObject(`${idInfo}.serialnumber`, 'Serial number', 'value', 'string', serialnumber);

		generateStateObject(`${idProcessDataIn}.raw`, 'PDI', 'value', 'string', processdatain);

		if (devicespec != null) {
			try {
				adapter.log.info(devicespec.deviceSpecName + ' loaded');

				devicespec.processDataIn.forEach((/** @type {{ name: string; minValue: number; maxValue: number; bitOffset: number; bitWidth: number; encoding: string; stateConfiguration: { name: string; unit: string; type: string; role: string; scalingFactor: number; scalingOffset: number; generateValue: boolean; generateStatus: boolean; generateChannel: boolean; }; states: any[]; }} */ pdi) => {
					
					let sc = pdi.stateConfiguration;
					let baseId = `${idProcessDataIn}.${getIdString(sc.name)}`;

					let state = 'OK'; //TODO: parse state as string
					let value = 'NaN'; //TODO: parse value as target type

					if (sc.generateChannel || sc.generateStatus || sc.generateValue) {
						if (sc.generateChannel == true) {
							generateChannelObject(baseId, sc.name);
							if (sc.generateStatus) {
								generateStateObject(`${baseId}.status`, 'Status', 'info.status', 'string', state);
							}
							if (sc.generateValue) {
								//value must fit target type!
								generateStateObject(`${baseId}.value`, 'Value', sc.role, sc.type, value, sc.unit);
							}
						}
						else { //without channel
							if (sc.generateStatus) {
								generateStateObject(`${baseId}_status`, `${sc.name} Status`, 'info.status', 'string', state);
							}
							if (sc.generateValue) {
								//value must fit target type!
								generateStateObject(`${baseId}`, sc.name, sc.role, sc.type, value, sc.unit);
							}
						}
					}
					else {
						//ERROR
						adapter.log.info('IO-Link adapter: No states are generated!');
					}

				});
			}
			catch (error) {
				adapter.log.warn('IO-Link adapter - ERROR: ' + error);
			}
		} else {
			adapter.log.warn('no devicespec?: ' + devicespec);
		}

	} catch (error) {
		adapter.log.info('IO-Link adapter - ERROR: ' + error);
		adapter.log.error(error);
		adapter.stop();
	}
}

// function for fetching data
const getData = async (endpoint, iolinkport) => {
	try {
		//sensor info and process data requests
		let requestSensorData = getRequestBody(`/iolinkmaster/port[${iolinkport}]/iolinkdevice/pdin/getdata`);
		let requestSensorName = getRequestBody(`/iolinkmaster/port[${iolinkport}]/iolinkdevice/productname/getdata`);
		let requestSensorComSpeed = getRequestBody(`/iolinkmaster/port[${iolinkport}]/comspeed/getdata`);
		let requestSensorCycletime = getRequestBody(`/iolinkmaster/port[${iolinkport}]/mastercycletime_actual/getdata`);
		let requestSensorVendorId = getRequestBody(`/iolinkmaster/port[${iolinkport}]/iolinkdevice/vendorid/getdata`);
		let requestSensorId = getRequestBody(`/iolinkmaster/port[${iolinkport}]/iolinkdevice/deviceid/getdata`);
		let requestDeviceSn = getRequestBody(`/iolinkmaster/port[${iolinkport}]/iolinkdevice/serial/getdata`);
		let requestSensorStatus = getRequestBody(`/iolinkmaster/port[${iolinkport}]/iolinkdevice/status/getdata`);

		//master info and process data requests
		let requestMasterCurrent = getRequestBody(`/processdatamaster/current/getdata`);
		let requestMasterCurrentUnit = getRequestBody(`/processdatamaster/current/unit/getdata`);
		let requestMasterVoltage = getRequestBody(`/processdatamaster/voltage/getdata`);
		let requestMasterVoltageUnit = getRequestBody(`/processdatamaster/voltage/unit/getdata`);
		let requestMasterTemperature = getRequestBody(`/processdatamaster/temperature/getdata`);
		let requestMasterTemperatureUnit = getRequestBody(`/processdatamaster/temperature/unit/getdata`);
		let requestMasterStatus = getRequestBody(`/processdatamaster/supervisionstatus/getdata`);
		let requestMasterName = getRequestBody(`/deviceinfo/productcode/getdata`);
		let requestMasterSerial = getRequestBody(`/deviceinfo/serialnumber/getdata`);
		let requestMasterSoftwareRevision = getRequestBody(`/deviceinfo/swrevision/getdata`);
		let requestMasterBootloaderRevision = getRequestBody(`/deviceinfo/bootloaderrevision/getdata`);
		let requestMasterHardwareRevision = getRequestBody(`/deviceinfo/hwrevision/getdata`);
		let requestMasterMac = getRequestBody(`/iotsetup/network/macaddress/getdata`);

		
		let masterDeviceName = await getValue(endpoint, requestMasterName);

		let availablPorts = 0;
		switch(masterDeviceName)
		{
			case 'AL1350':
				availablPorts = 4;
				break;
			case 'AL1352':
				availablPorts = 8;
				break;
			default:
				adapter.log.error(`IO-Link adapter - Master ${masterDeviceName} is not supported!`);
				adapter.stop();
				break;
			}

		let sensorName = await getValue(endpoint, requestSensorName);
		//TODO: check sensor name

		adapter.setObjectNotExists(masterDeviceName, {
			type: 'device',
			common: {
				name: `IFM ${masterDeviceName}`,
				read: true,
				write: false
			}
		});

		var idMasterProcessData = `${masterDeviceName}.processdata`;
		var idMasterInfo = `${masterDeviceName}.info`;

		adapter.setObjectNotExists(idMasterProcessData, {
			type: 'channel',
			common: {
				name: `Process data (Master)`,
				read: true,
				write: false
			}
		});


		adapter.setObjectNotExists(idMasterInfo, {
			type: 'channel',
			common: {
				name: `Info`,
				read: true,
				write: false
			}
		});

		adapter.setObjectNotExists(`${masterDeviceName}.${iolinkport}`, {
			type: 'channel',
			common: {
				name: `IO-Link port ${iolinkport}`,
				read: true,
				write: false
			}
		});

		var idSensor = `${masterDeviceName}.${iolinkport}.${sensorName}`;

		const json = require('./devices/device-spec.json'); //(with path)
		var dummySpec = DeviceSpec.from(json);

		generateChannelObject(`${masterDeviceName}.iolinkports`, 'IO-Link Ports')
		await getPortData(endpoint, 1, `${masterDeviceName}.iolinkports`, null);
		await getPortData(endpoint, 2, `${masterDeviceName}.iolinkports`, dummySpec);
		//await getPortData(endpoint, 3, `${masterDeviceName}.iolinkports`);


		adapter.setObjectNotExists(idSensor, {
			type: 'device',
			common: {
				name: `IFM ${sensorName}`,
				read: true,
				write: false
			}
		});

		var idProcessData = `${idSensor}.processdata`;
		var idIoLink = `${idSensor}.iolink`;

		adapter.setObjectNotExists(idProcessData, {
			type: 'channel',
			common: {
				name: `Process data`,
				read: true,
				write: false
			}
		});

		adapter.setObjectNotExists(idIoLink, {
			type: 'channel',
			common: {
				name: `IO-Link`,
				read: true,
				write: false
			}
		});
		
		let bytes = hexToBytes(await getValue(endpoint, requestSensorData));
		let temperatureValue = (byteArrayToNumber([bytes[7], bytes[6]]) >> 2) * 0.1;
		let flowrateValue = byteArrayToNumber([bytes[5], bytes[4]]) * 0.1;
		let totalValue = byteArrayToFloat([bytes[0], bytes[1], bytes[2], bytes[3]])

		let out1Value = (bytes[7] & 0x01) === 0x01;
		let out2Value = (bytes[7] & 0x02) === 0x02;


		adapter.setObjectNotExists(`${idProcessData}.flowrate`, {
			type: 'state',
			common: {
				name: 'FlowRate',
				role: 'value',
				type: 'number',
				value: flowrateValue,
				unit: 'l/min',
				read: true,
				write: false
			}
		});
		adapter.setState(`${idProcessData}.flowrate`, flowrateValue, true);

		adapter.setObjectNotExists(`${idProcessData}.temperature`, {
			type: 'state',
			common: {
				name: 'Temperature',
				role: 'value.temperature',
				type: 'number',
				value: temperatureValue,
				unit: '°C',
				read: true,
				write: false
			}
		});
		adapter.setState(`${idProcessData}.temperature`, temperatureValue, true);

		adapter.setObjectNotExists(`${idProcessData}.total`, {
			type: 'state',
			common: {
				name: 'Total',
				role: 'value',
				type: 'number',
				value: totalValue,
				unit: 'l',
				read: true,
				write: false
			}
		});
		adapter.setState(`${idProcessData}.total`, totalValue, true);

		adapter.setObjectNotExists(`${idProcessData}.out1`, {
			type: 'state',
			common: {
				name: 'Out1',
				role: 'indicator',
				type: 'boolean',
				value: out1Value,
				unit: '',
				read: true,
				write: false
			}
		});
		adapter.setState(`${idProcessData}.out1`, out1Value, true);

		adapter.setObjectNotExists(`${idProcessData}.out2`, {
			type: 'state',
			common: {
				name: 'Out2',
				role: 'indicator',
				type: 'boolean',
				value: out2Value,
				unit: '',
				read: true,
				write: false
			}
		});
		adapter.setState(`${idProcessData}.out2`, out1Value, true);


		//#################################################################################
		//IO-Link infos

		let comSpeed = '';
		switch(await getValue(endpoint, requestSensorComSpeed)) {
			case 0:
				comSpeed = 'COM1 (4.8 kBaud)';
				break;
			case 1:
				comSpeed = 'COM2 (38.4 kBaud)';
				break;
			case 2:
				comSpeed = 'COM3 (230.4 kBaud)';
				break;
		}

		adapter.setObjectNotExists(`${idIoLink}.comspeed`, {
			type: 'state',
			common: {
				name: 'Communication Mode',
				role: 'value',
				type: 'string',
				value: comSpeed,
				read: true,
				write: false
			}
		});
		adapter.setState(`${idIoLink}.comspeed`, comSpeed, true);

		
		let deviceStatus = '';
		switch(await getValue(endpoint, requestSensorStatus)) {
			case 0:
				deviceStatus = 'Not connected';
				break;
			case 1:
				deviceStatus = 'Preoperate';
				break;
			case 2:
				deviceStatus = 'Operate';
				break;
			case 3:
				deviceStatus = 'Communication error';
				break;
		}

		adapter.setObjectNotExists(`${idIoLink}.status`, {
			type: 'state',
			common: {
				name: 'Device status',
				role: 'info.status',
				type: 'string',
				value: deviceStatus,
				read: true,
				write: false
			}
		});
		adapter.setState(`${idIoLink}.status`, deviceStatus, true);


		let cycletime = await getValue(endpoint, requestSensorCycletime) / 1000;

		adapter.setObjectNotExists(`${idIoLink}.mastercycletime`, {
			type: 'state',
			common: {
				name: 'Master Cycletime',
				role: 'value.interval',
				type: 'number',
				unit: 'ms',
				value: cycletime,
				read: true,
				write: false
			}
		});
		adapter.setState(`${idIoLink}.mastercycletime`, cycletime, true);


		let vendorid = await getValue(endpoint, requestSensorVendorId);

		adapter.setObjectNotExists(`${idIoLink}.vendorid`, {
			type: 'state',
			common: {
				name: 'Vendor ID',
				role: 'value',
				type: 'string',
				value: vendorid,
				read: true,
				write: false
			}
		});
		adapter.setState(`${idIoLink}.vendorid`, vendorid, true);


		let sensorid = await getValue(endpoint, requestSensorId);

		adapter.setObjectNotExists(`${idIoLink}.sensorid`, {
			type: 'state',
			common: {
				name: 'Sensor ID',
				role: 'value',
				type: 'string',
				value: sensorid,
				read: true,
				write: false
			}
		});
		adapter.setState(`${idIoLink}.sensorid`, sensorid, true);


		let serialnumber = await getValue(endpoint, requestDeviceSn);

		adapter.setObjectNotExists(`${idIoLink}.serialnumber`, {
			type: 'state',
			common: {
				name: 'Serial number',
				role: 'value',
				type: 'string',
				value: serialnumber,
				read: true,
				write: false
			}
		});
		adapter.setState(`${idIoLink}.serialnumber`, serialnumber, true);


		//###############################################################################
		//Master process data

		let masterStatus = '';
		switch(await getValue(endpoint, requestMasterStatus)) {
			case 0:
				masterStatus = 'OK';
				break;
			case 1:
				masterStatus = 'Fault';
				break;
		}

		adapter.setObjectNotExists(`${idMasterProcessData}.status`, {
			type: 'state',
			common: {
				name: 'Supervision status',
				role: 'info.status',
				type: 'string',
				value: masterStatus,
				read: true,
				write: false
			}
		});
		adapter.setState(`${idMasterProcessData}.status`, masterStatus, true);


		let current = await getValue(endpoint, requestMasterCurrent);

		let currentUnit = await getValue(endpoint, requestMasterCurrentUnit);

		adapter.setObjectNotExists(`${idMasterProcessData}.current`, {
			type: 'state',
			common: {
				name: 'Current',
				role: 'value.current',
				type: 'number',
				unit: currentUnit,
				value: current,
				read: true,
				write: false
			}
		});
		adapter.setState(`${idMasterProcessData}.current`, current, true);


		let temperature = await getValue(endpoint, requestMasterTemperature);

		let temperatureUnit = await getValue(endpoint, requestMasterTemperatureUnit);

		adapter.setObjectNotExists(`${idMasterProcessData}.temperature`, {
			type: 'state',
			common: {
				name: 'Temperature',
				role: 'value.temperature',
				type: 'number',
				unit: temperatureUnit,
				value: temperature,
				read: true,
				write: false
			}
		});
		adapter.setState(`${idMasterProcessData}.temperature`, temperature, true);


		let voltage = await getValue(endpoint, requestMasterVoltage);

		let voltageUnit = await getValue(endpoint, requestMasterVoltageUnit);

		adapter.setObjectNotExists(`${idMasterProcessData}.voltage`, {
			type: 'state',
			common: {
				name: 'Voltage',
				role: 'value.voltage',
				type: 'number',
				unit: voltageUnit,
				value: voltage,
				read: true,
				write: false
			}
		});
		adapter.setState(`${idMasterProcessData}.voltage`, voltage, true);


		let bootloaderRev = await getValue(endpoint, requestMasterBootloaderRevision)

		adapter.setObjectNotExists(`${idMasterInfo}.bootloaderrev`, {
			type: 'state',
			common: {
				name: 'Bootloader revision',
				role: 'value',
				type: 'string',
				value: bootloaderRev,
				read: true,
				write: false
			}
		});
		adapter.setState(`${idMasterInfo}.bootloaderrev`, bootloaderRev, true);


		let hardwareRev = await getValue(endpoint, requestMasterHardwareRevision);

		adapter.setObjectNotExists(`${idMasterInfo}.hardwarerev`, {
			type: 'state',
			common: {
				name: 'Hardware revision',
				role: 'value',
				type: 'string',
				value: hardwareRev,
				read: true,
				write: false
			}
		});
		adapter.setState(`${idMasterInfo}.hardwarerev`, hardwareRev, true);


		let mac = await getValue(endpoint, requestMasterMac);

		adapter.setObjectNotExists(`${idMasterInfo}.mac`, {
			type: 'state',
			common: {
				name: 'MAC',
				role: 'info.mac',
				type: 'string',
				value: mac,
				read: true,
				write: false
			}
		});
		adapter.setState(`${idMasterInfo}.mac`, mac, true);


		let softwareRev = await getValue(endpoint, requestMasterSoftwareRevision);

		adapter.setObjectNotExists(`${idMasterInfo}.softwarerev`, {
			type: 'state',
			common: {
				name: 'Software revision',
				role: 'value',
				type: 'string',
				value: softwareRev,
				read: true,
				write: false
			}
		});
		adapter.setState(`${idMasterInfo}.softwarerev`, softwareRev, true);


		let masterSerial = await getValue(endpoint, requestMasterSerial);

		adapter.setObjectNotExists(`${idMasterInfo}.serial`, {
			type: 'state',
			common: {
				name: 'Serial number',
				role: 'value',
				type: 'string',
				value: masterSerial,
				read: true,
				write: false
			}
		});
		adapter.setState(`${idMasterInfo}.serial`, masterSerial, true);


		adapter.log.info('IO-Link adapter - fetching data completed');
		adapter.log.info('IO-Link adapter - shutting down until next scheduled call');
		adapter.stop();

	}  
	catch (error) {
		adapter.log.info('IO-Link adapter - ERROR: ' + error);
		adapter.log.error(error);
		adapter.stop();
	}
}

const getValue = async (endpoint, request) => {
	var res = await axios({
		method: 'post',
		url: `http://${endpoint}`,
		data: request,
		headers: {'content-type' : 'application/json'}
	});
	return res.data['data']['value'];
}

/**
 * @param {string} name
 */
function getIdString(name) {
	return name.replace(/[&\/\\#,+()$~%.'":*?<>{}\s]/g, '_').toLowerCase();
}

/**
 * @param {string} id
 * @param {string} name
 */
function generateChannelObject(id, name) {
	//TODO: manuell prüfen ob channel schon existiert?
	adapter.setObjectNotExists(id, {
		type: 'channel',
		common: {
			name: name,
			read: true,
			write: false
		}
	});
}

/**
 * @param {string} id
 * @param {any} name
 */
function generateDeviceObject(id, name) {
	//TODO: manuell prüfen ob device schon existiert?
	adapter.setObjectNotExists(id, {
		type: 'device',
		common: {
			name: name,
			read: true,
			write: false
		}
	});
}

/**
 * @param {string} id
 * @param {string} name
 * @param {string} role
 * @param {string} type
 * @param {string | number} value
 * @param {string} unit
 */
function generateStateObject(id, name, role, type, value, unit = '') {
	//TODO: manuell prüfen ob state schon existiert?
	adapter.setObjectNotExists(id, {
		type: 'state',
		common: {
			name: name,
			role: role,
			type: type,
			value: value,
			unit: unit,
			read: true,
			write: false
		}
	});
	adapter.setState(id, value, true);
}

/**
 * @param {string} adr
 */
function getRequestBody(adr) {
	return `{"code": "request", "cid": 1, "adr": "${adr}"}`;
}

//Convert a hex string to a byte array
/**
 * @param {string} hexString
 */
function hexToBytes(hexString) {
    for (var bytes = [], c = 0; c < hexString.length; c += 2)
        bytes.push(parseInt(hexString.substr(c, 2), 16));
    return bytes;
}

//Convert a byte array to a number
function byteArrayToNumber(byteArray) {
    var value = 0;
    for ( var i = byteArray.length - 1; i >= 0; i--) {
        value = (value * 256) + byteArray[i];
    }

    return value;
};

//Convert a byte array to a float32
function byteArrayToFloat(byteArray) {
    var buf = new ArrayBuffer(4);
    var view = new DataView(buf);

    byteArray.forEach(function (b, i) {
        view.setUint8(i, b);
    });

    return view.getFloat32(0);
};

// is called when adapter shuts down
adapter.on('unload', function (callback) {
	try {
		adapter.log.info('cleaned everything up...');
		callback();
	} catch (e) {
		callback();
	}
});

// is called when adapter starts
adapter.on('ready', function () {
	adapter.log.info('IO-Link adapter - started');

	const endpoint = adapter.config.ifmSmA1x5xIp;
	const iolinkport = adapter.config.ifmSmIoLinkPort;

	adapter.log.debug('IO-Link adapter - fetching data started');
	if(endpoint && iolinkport){
		getData(endpoint, iolinkport);
	} else {
		adapter.log.error('IO-Link adapter - config incomplete!');
		adapter.stop();
	}
});


