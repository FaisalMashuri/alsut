var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { ReportPage } from '../report/report';
import { LoginPage } from '../login/login';
import { BLE } from '@ionic-native/ble';
import { BackgroundMode } from '@ionic-native/background-mode';
import { UserDataProvider } from '../../providers/user-data/user-data';
import { HttpClient } from '@angular/common/http';
import moment from 'moment';
import swal from 'sweetalert2';
var CheckpointPage = /** @class */ (function () {
    function CheckpointPage(http, userDataProv, events, backgroundMode, geolocation, navCtrl, navParams, ble) {
        this.http = http;
        this.userDataProv = userDataProv;
        this.events = events;
        this.backgroundMode = backgroundMode;
        this.geolocation = geolocation;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.ble = ble;
        this.devices = [];
        this.beacons = [];
        this.mqttStatusCaption = 'not connected';
        this.gpsStatusCaption = 'finding location...';
        this.userdata = this.userDataProv.getUser();
        this.guardName = this.userdata.name;
        this.nextBeaconID = this.userdata.next_beacon_id;
        this.nextBeaconDescription = this.userdata.next_beacon_description;
        this.clusterName = this.userdata.cluster_name;
        this.host = this.userDataProv.getHost();
        this.mqttData = {
            hostname: 'm10.cloudmqtt.com',
            port: '34384',
            clientId: 'id-01-' + Math.floor(Math.random() * 6),
            username: 'psuyddse',
            password: '0LFWtA334Zyy',
            currentTopic: 'v1/api/cluster',
            reconnectTimeout: 2000,
            ssl: true
        };
    }
    CheckpointPage.prototype.ionViewDidLoad = function () {
        this.MQTTconnect();
    };
    CheckpointPage.prototype.ionViewWillEnter = function () {
        // this.MQTTconnect();
    };
    CheckpointPage.prototype.ionViewDidLeave = function () {
        this.client.disconnect();
    };
    CheckpointPage.prototype.MQTTconnect = function () {
        var reconnectTimeout = 2000;
        this.client = new Paho.MQTT.Client(this.mqttData.hostname, Number(this.mqttData.port), this.mqttData.clientId //Client Id
        );
        //callbacks
        this.client.onConnectionLost = this.onConnectionLost;
        this.client.onMessageArrived = this.onMessageArrived;
        var options = {
            timeout: reconnectTimeout,
            useSSL: this.mqttData.ssl,
            onSuccess: this.onConnect(this),
            userName: '',
            password: '',
            onFailure: this.doFail
        };
        if (this.mqttData.username != "") {
            options.userName = this.mqttData.username;
            options.password = this.mqttData.password;
        }
        this.client.connect(options);
    };
    ;
    CheckpointPage.prototype.onConnect = function (callback) {
        return function () {
            callback.mqttStatusCaption = 'OK';
            callback.getCoordinate();
            callback.scanBLE();
        };
    };
    CheckpointPage.prototype.doFail = function (e) {
        // console.log("Error", e);
        // this.MQTTconnect();
        this.error = e;
    };
    CheckpointPage.prototype.onConnectionLost = function (responseObject) {
        if (responseObject.errorCode !== 0) {
            // console.log("Error on Connecting: " + responseObject.errorMessage);
            // this.MQTTconnect();
        }
    };
    CheckpointPage.prototype.onMessageArrived = function (message) {
        console.log(message.payloadString);
    };
    CheckpointPage.prototype.getCoordinate = function () {
        var _this = this;
        var watch = this.geolocation.watchPosition({
            enableHighAccuracy: true,
            timeout: 2000,
            maximumAge: 3000
        });
        watch.subscribe(function (data) {
            if (typeof data.coords !== 'undefined') {
                _this.gpsStatusCaption = 'OK';
                var coordinate = {
                    lat: data.coords.latitude,
                    lng: data.coords.longitude,
                    accuracy: data.coords.accuracy
                };
                _this.sendTrackData(coordinate);
            }
            else {
                _this.gpsStatusCaption = 'finding location...';
            }
        });
    };
    CheckpointPage.prototype.sendTrackData = function (coordinate) {
        this.sendDataToServer(coordinate, 0, '');
    };
    CheckpointPage.prototype.sendDataToServer = function (coordinate, type, pointId) {
        var nowDate = moment().format('YYYY-MM-DD h:mm:ss');
        var data = {
            type: 'tracking',
            data: {
                userid: this.userdata.id,
                name: this.userdata.name,
                trackid: this.userdata.track_code,
                cluster_code: this.userdata.cluster_code,
                pointid: pointId,
                date: nowDate,
                lat: coordinate.lat,
                lng: coordinate.lng,
                acc: coordinate.accuracy
            }
        };
        this.MQTTsend(this.mqttData.currentTopic, data);
    };
    CheckpointPage.prototype.MQTTsend = function (topic, mess) {
        var message = new Paho.MQTT.Message(JSON.stringify(mess));
        message.destinationName = topic;
        this.client.send(message);
        console.log("sending message");
    };
    CheckpointPage.prototype.MQTTmonitor = function () {
        // console.log("MQTT Monitoring Up for " + this.mqttData.currentTopic);
        this.client.subscribe(this.mqttData.currentTopic);
    };
    CheckpointPage.prototype.sendCheckPointData = function (cubeaconID) {
        this.sendDataToServer('', 1, cubeaconID);
    };
    // checkpoint() {
    // 	this.sendCheckPointData('');
    // 	swal({
    //       title: 'Success!',
    //       text: 'Check Point CA-01 Berhasil',
    //       type: 'success',
    //       confirmButtonText: 'Ok'
    //     })
    // }
    CheckpointPage.prototype.report = function () {
        this.navCtrl.push(ReportPage);
    };
    CheckpointPage.prototype.stop = function () {
        var _this = this;
        swal({
            title: 'Anda yakin ingin stop patroli anda ?',
            text: "",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Iya'
        }).then(function (result) {
            if (result.value === true) {
                _this.navCtrl.push(LoginPage);
            }
        });
    };
    CheckpointPage.prototype.showMessage = function (text) {
        swal({
            title: 'Success!',
            text: text,
            type: 'success',
            confirmButtonText: 'Ok'
        });
    };
    CheckpointPage.prototype.scanBLE = function () {
        var _this = this;
        // this.devices = [];  // clear list
        this.ble.
            this.ble.startScan([]).subscribe(function (device) { return _this.onDeviceDiscovered(device); }, function (error) { return _this.scanError(error); });
        // setTimeout(this.setStatus.bind(this), 5000, 'Scan complete');
    };
    CheckpointPage.prototype.onDeviceDiscovered = function (device) {
        // this.showMessage('Discovered ' + JSON.stringify(device));
        // this.devices.push(device);
        if (this.nextBeaconID == device.id) {
            this.checkPointReach(device.id);
        }
        // this.log = this.log + ' - ' + device.id;
        // this.nextBeaconID
        // this.sendCheckPointData(device.id);
        // this.error = JSON.stringify(this.devices);
        // let test = this.ble.read(device.id, device.name, '');
        // this.error = JSON.stringify(test);
    };
    // If location permission is denied, you'll end up here
    CheckpointPage.prototype.scanError = function (error) {
        // this.showMessage('Error ' + error);
        this.error = JSON.stringify(error);
    };
    CheckpointPage.prototype.checkPointReach = function (beacon_id) {
        var _this = this;
        var link = this.host + '/route/checkpoint';
        var myData = JSON.stringify({ beacon_id: beacon_id });
        this.http.post(link, myData, { headers: { 'Content-Type': 'application/json' } })
            .subscribe(function (result) {
            var rsl;
            rsl = result;
            if (rsl.status == true) {
                if (rsl.data.next == false) {
                    swal({
                        title: 'Success!',
                        text: 'Point terakhir tercapai',
                        type: 'success',
                        confirmButtonText: 'Ok'
                    });
                    _this.navCtrl.push(LoginPage);
                }
                swal({
                    title: 'Check Point Tercapai!',
                    text: JSON.stringify(rsl.data.current.description),
                    type: 'success',
                    confirmButtonText: 'Ok'
                });
                _this.nextBeaconID = rsl.data.next.beacon_id;
                _this.nextBeaconDescription = rsl.data.next.description + '/' + rsl.data.next.beacon_id;
            }
            else {
                swal({
                    title: 'Error!',
                    text: JSON.stringify(rsl.message),
                    type: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        }, function (error) {
            swal({
                title: 'Error!',
                text: JSON.stringify(error.message),
                type: 'error',
                confirmButtonText: 'Ok'
            });
        });
    };
    CheckpointPage = __decorate([
        IonicPage(),
        Component({
            selector: 'page-checkpoint',
            templateUrl: 'checkpoint.html',
        }),
        __metadata("design:paramtypes", [HttpClient, UserDataProvider, Events, BackgroundMode, Geolocation, NavController, NavParams, BLE])
    ], CheckpointPage);
    return CheckpointPage;
}());
export { CheckpointPage };
// AC:23:3F:23:7A:F8
// C2:00:0A:00:01:E9
//# sourceMappingURL=checkpoint.js.map