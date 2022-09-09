<img src="admin/logo.png" alt="IO-Link Logo" width="150" height="150" />

# ioBroker.io-link

### 0.1.1
Rename adapter and generalize function for different IO-Link sensors

## Description
This adapter enables the integration of IO-Link sensors, thru a IFM IO-Link Master with IoT capabilites (AL1x5x).

![Screenshot - Object tree](docu/Screenshot_ObjectTree.png)

### Supported IO-Link masters

| Master                 | AL1350             | AL1351             | AL1352             | AL1353             | AL1950             |
|------------------------|--------------------|--------------------|--------------------|--------------------|--------------------|
| IO-Link ports          | 4                  | 4                  | 8                  | 8                  | 8                  |
| IO-Link connector      | M12                | M12                | M12                | M12                | screw terminals    |
| Ethernet in connector  | M12 female         | M12 female         | M12 female         | M12 female         | RJ45               |
| Ethernet out connector | M12 female         | M12 female         | M12 female         | M12 female         | RJ45               |
| Power in  connector    | M12 male           | M12 male           | M12 male           | M12 male           | screw terminals    |
| Environment            | field              | field              | field              | field              | cabinet            |
| Hygienic design        |                    | :heavy_check_mark: |                    | :heavy_check_mark: |                    |
| Protection type        | IP 67              | IP 69K             | IP 67              | IP 69K             | IP20               |

#### Available master process data

* Status
* Current
* Voltage
* Temperature

#### Available master info data

* Software revision
* Bootloader revision
* Hardware revision
* Serial number
* MAC

#### Available IO-Link device info data

For each connected IO-Link device/sensor the following data are provided:

* Communication mode
* Master cycletime
* Sensor ID
* Vendor ID
* Serial number
* Device status

### Supported sensors

* [Magnetic-inductive volumetric flow meters from the manufacturer IFM](devices/IfmFlowSensor)
* Pressure sensors from the manufacturer WIKA
* Pressure sensors (also for manometric level measurement) from the manufacturer IFM


## Usage
* Install this adapter to ioBroker (Expert mode -> install from url)
* Create an instance of this adapter
* Enter your IO-Link master IP address

## Changelog
* 0.1.1 Rename adapter and generalize function for different IO-Link sensors
* 0.0.1 Inital release

## Credits
This app is made possible by contributions from:
* [Elias Rümmler](http://www.100prznt.de) ([@100prznt](https://github.com/100prznt))

## License
The ioBroker.io-link Adapter is licensed under [MIT](http://www.opensource.org/licenses/mit-license.php "Read more about the MIT license form"). Refer to [LICENSE](https://github.com/100prznt/ioBroker.io-link/blob/master/LICENSE) for more information.

## Contributions
Contributions are welcome. Fork this repository and send a pull request if you have something useful to add.

-----------

Copyright &copy; 2022 Elias Ruemmler <pool@100prznt.de>
