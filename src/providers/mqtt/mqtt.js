var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
var MqttProvider = /** @class */ (function () {
    function MqttProvider(http) {
        this.http = http;
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
            clientId: 'uid-' + Math.floor(Math.random() * 100),
            cleanSession: false,
        };
        // this.status = false;
    }
    MqttProvider.prototype.MQTTconnect = function () {
        var reconnectTimeout = 2000;
        console.log("Start MQTT Client Service");
        this.client = new Paho.MQTT.Client(this.mqttData.host, Number(this.mqttData.port), this.mqttData.clientId //Client Id
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
        if (this.mqttData.username != "") {
            options.userName = this.mqttData.username;
            options.password = this.mqttData.password;
        }
        console.log("TXSS", options);
        this.client.connect(options);
    };
    ;
    MqttProvider.prototype.onConnect = function () {
        this.status = true;
        console.log("MQTT Service Success Connected");
        // this.MQTTsend('topic', 'mess');
    };
    MqttProvider.prototype.getStatus = function () {
        // return this.status;
        // console.log(this.status);
        return true;
    };
    MqttProvider.prototype.doFail = function (e) {
        console.log("Error", e);
        this.MQTTconnect();
    };
    MqttProvider.prototype.onConnectionLost = function (responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("Error on Connecting: " + responseObject.errorMessage);
            this.MQTTconnect();
        }
    };
    MqttProvider.prototype.onMessageArrived = function (message) {
        console.log(message.payloadString);
    };
    MqttProvider.prototype.MQTTmonitor = function () {
        console.log("MQTT Monitoring Up for " + this.mqttData.currentTopic);
        this.client.subscribe(this.mqttData.currentTopic);
    };
    MqttProvider.prototype.MQTTsend = function (topic, mess) {
        var message = new Paho.MQTT.Message(mess);
        message.destinationName = topic;
        this.client.send(message);
        console.log("sending message");
    };
    MqttProvider = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [HttpClient])
    ], MqttProvider);
    return MqttProvider;
}());
export { MqttProvider };
//# sourceMappingURL=mqtt.js.map