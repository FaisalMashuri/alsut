import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

declare var Paho: any;

@Injectable()
export class MqttProvider {
	status: any;
	client: any;
	mqttData: any;

	constructor(public http: HttpClient) {
		this.mqttData = { 
			// host: 'm10.cloudmqtt.com',
			// username: 'psuyddse', 
			// password: '0LFWtA334Zyy',
			// currentTopic: 'test/monitor',
            // ssl: true,
            // port: 34384,
            host: 'demo.thingsboard.io',
            username: '4GkCXm6Y6LTjUIU25pcB', 
            password: '',
            currentTopic: 'test/monitor',
			ssl: true,
			port: 1883,
			clientId:'uid-' + Math.floor( Math.random() * 100 ) ,
            cleanSession: false,
		};

		// this.status = false;

	}

	MQTTconnect() {
		let reconnectTimeout = 2000;
		console.log("Start MQTT Client Service");
		this.client = new Paho.MQTT.Client(
				this.mqttData.host,
				Number(this.mqttData.port),
				this.mqttData.clientId  //Client Id
			);
		//callabacks
		this.client.onConnectionLost = this.onConnectionLost;  
		this.client.onMessageArrived = this.onMessageArrived;
		var options = {
			timeout: reconnectTimeout,
			useSSL: this.mqttData.ssl,
			onSuccess: this.onConnect,
			userName: '',
			password: '',
			onFailure: this.doFail
		};
		if(this.mqttData.username!="" ){
			options.userName = this.mqttData.username;
			options.password = this.mqttData.password;
		}
		console.log("TXSS",options);
		this.client.connect(options);
	};

	onConnect() {
		this.status = true;
		console.log("MQTT Service Success Connected");   
		// this.MQTTsend('topic', 'mess');
	}

	getStatus() {
		// return this.status;
		// console.log(this.status);
		return true;
	}
	doFail(e){
		console.log("Error", e);
		this.MQTTconnect();
	}

	onConnectionLost(responseObject) {
		if (responseObject.errorCode !== 0) {
			console.log("Error on Connecting: "+responseObject.errorMessage);
			this.MQTTconnect();
		}
	}

	onMessageArrived(message) {
		console.log(message.payloadString);
	}

	MQTTmonitor() {
		console.log("MQTT Monitoring Up for " + this.mqttData.currentTopic);
		this.client.subscribe(this.mqttData.currentTopic);
	}

	MQTTsend(topic, mess) {
		let message = new Paho.MQTT.Message(mess);
		message.destinationName = topic;
		this.client.send(message);
		console.log("sending message");
	}

}
