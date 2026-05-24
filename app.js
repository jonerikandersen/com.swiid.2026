'use strict';

const Homey = require('homey');

class SwiidApp extends Homey.App {

	async onInit() {
		this.log(`${this.homey.manifest.id} v${this.homey.manifest.version} is running...`);
	}

}

module.exports = SwiidApp;
