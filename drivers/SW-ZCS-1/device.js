'use strict';

const { ZwaveDevice } = require('homey-zwavedriver');

class SwiidInter extends ZwaveDevice {

	async onNodeInit() {
		this.printNode();
		this.registerCapability('onoff', 'SWITCH_BINARY');
	}

}

module.exports = SwiidInter;
