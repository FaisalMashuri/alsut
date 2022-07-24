import { CheckversionPage } from './../checkversion/checkversion';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, Platform, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { ReportPage } from '../report/report';
import { HomePage } from '../home/home';
import { BackgroundMode } from '@ionic-native/background-mode';
import { UserDataProvider } from '../../providers/user-data/user-data';
import { HttpClient } from '@angular/common/http';
import { LocalNotifications } from '@ionic-native/local-notifications';
import moment from 'moment';
import swal from 'sweetalert2';
import { Network } from '@ionic-native/network';
import { delay } from 'rxjs/operator/delay';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
import { Storage } from '@ionic/storage'; //import storage untuk menyimpan data
import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { NativeAudio } from '@ionic-native/native-audio';

declare var Paho: any;

@IonicPage()
@Component({
    selector: 'page-checkpoint',
    templateUrl: 'checkpoint.html',
})

export class CheckpointPage {
    list: any[];

    mqttStatus: boolean;
    gpsStatus: boolean;
    clusterName: string;
    clusterCode: string;
    guardName: string;
    client: any;
    mqttData: any;
    devices: any[] = [];
    statusMessage: string;
    zone: any;
    userdata: any;
    nextBeaconID: any;
    nextBeaconDescription: any;
    nextCheckpointId: any;
    host: string;
    imageTransfer: string;
    blink: string;
    blickFlag: boolean;
    trackName: string;
    watch: any;
    watchSubscribe: any;
    flagNotifHome: boolean;
    datas: any[];
    checkpoint: any[];
    checkpointData: any[];
    currentCheckpoint: number;
    currentCheckpointDescription: string;
    distance: any;
    trackId: string;
    lat: any;
    long: any;
    tempLat: any;
    tempLong: any;
    gpsAccuracy: any;
    fileLogs: string;

    //notif koneksi dan gps
    koneksi: string;
    gps: string;
    kondisi: boolean;
    shift_id: string;
    unique_key: string;
    speed: any;

    //time
    private comment: any;
    private comment1: any;
    private startTime: any;
    private endTime: any;
    private task: number;
    private checkGPS: number;
    private pulseClock: number;
    private sendDataLocal: number;
    private datecaptionstart: string;
    private datecaptionend: string;
    private nowDate: string;
    private inumber: number = 0;
    private settings: any;
    private isFinish: boolean;

    private mapUrl: SafeUrl;
    private promise: Promise<string>;
    private checkpointCounter = [];
    private trackingStatus: boolean;
    private startCheckpoint: boolean;
    private userCheckpoint: Array<number>;

    constructor(
        private transfer: FileTransfer,
        private file: File,
        private storage: Storage, //deklarasi apabila data gagal di kirim
        private localNotifications: LocalNotifications,
        private http: HttpClient,
        private userDataProv: UserDataProvider,
        public events: Events,
        public backgroundMode: BackgroundMode,
        private geolocation: Geolocation,
        public navCtrl: NavController,
        public navParams: NavParams,
        private network: Network,
        //audio
        private nativeAudio: NativeAudio,
        //loading
        public loadingCtrl: LoadingController,
        public platform: Platform,
        protected _sanitizer: DomSanitizer) {
        moment.locale('id'); //test moment
        this.userdata = this.userDataProv.getUser();
        this.guardName = this.userdata.name;
        this.nextBeaconID = this.userdata.next_beacon_id;
        this.nextBeaconDescription = this.userdata.next_beacon_description;
        this.nextCheckpointId = this.userdata.checkpoint_id;
        this.clusterName = this.userDataProv.getSelectedCluster();
        this.clusterCode = this.userDataProv.getSelectedClusterCode();
        this.trackName = this.userDataProv.getSelectedTrackName();
        this.trackId = this.userDataProv.getSelectedTrack();
        this.settings = this.userDataProv.getSetting();
        this.currentCheckpointDescription = '';
        this.currentCheckpoint = 0;
        this.host = this.userDataProv.getHost();
        this.mqttStatus = false;
        this.trackingStatus = false;
        this.startCheckpoint = false;
        this.mapUrl = this._sanitizer.bypassSecurityTrustResourceUrl('http://guardtour.alam-sutera.com/cluster/' + this.clusterCode + '/webview');
        this.fileLogs = '';
        this.mqttData = {
            host: '43.251.98.16',
            currentTopic: 'api',
            ssl: false,
            port: 8083,
            clientId: 'uid-' + Math.floor(Math.random() * 100),
            cleanSession: false,
        };

        this.userDataProv.setPatrol({ start: this.getDateTime() });
        let patrolId = this.userDataProv.getPatrol();
        this.shift_id = patrolId.shift_id;
        this.unique_key = patrolId.unique_key;
        this.datas = new Array();
        this.startTime = new Date();
        this.userCheckpoint = new Array(0);
        this.isFinish = false;

    }

    ionViewDidLoad() { 
        this.platform.ready().then(() => { 
            //  'trackID' can be anything
            this.nativeAudio.preloadComplex('trackID', 'assets/audio/akurasiBuruk.mp3', 1, 1, 6).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            this.nativeAudio.preloadSimple('akurasiBuruk', 'assets/audio/akurasiBuruk.mp3').then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('finish', 'assets/audio/finish.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });


            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('selesai', 'assets/audio/selesai.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('tunggu', 'assets/audio/tunggu.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point1', 'assets/audio/1.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('mulai', 'assets/audio/mulai.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point2', 'assets/audio/2.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point3', 'assets/audio/3.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point4', 'assets/audio/4.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point5', 'assets/audio/5.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point6', 'assets/audio/6.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point7', 'assets/audio/7.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point8', 'assets/audio/8.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point9', 'assets/audio/9.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point10', 'assets/audio/10.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point11', 'assets/audio/11.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point12', 'assets/audio/12.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point13', 'assets/audio/13.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point14', 'assets/audio/15.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point15', 'assets/audio/15.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });


            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point16', 'assets/audio/16.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point17', 'assets/audio/17.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point18', 'assets/audio/18.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point19', 'assets/audio/19.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });

            // 'trackID' can be anything
            this.nativeAudio.preloadComplex('point20', 'assets/audio/20.mp3', 1, 1, 0).then(function () {
                console.log("audio loaded!");
            }, function (err) {
                console.log("audio failed: " + err);
            });
            this.getCheckpointData();
            this.initial(); 
        }); 
    }

    async initial() {
        await this.createFileLog(this.unique_key + '.logs');
        await this.sendLog('Platform Ready');
        await this.sendLog('settings ' + JSON.stringify(this.settings));
        await this.sendLog('Waiting GPS to Ready');
        this.trackingStart();
        this.startGPSTracking();
    }

    trackingStart(){
        this.MQTTconnect();
        this.flagNotifHome = false;
        this.datecaptionstart = moment(this.startTime).format('D-M-Y HH:mm:ss');
        this.nativeAudio.play("tunggu")
        swal({
            title: 'Warning !',
            text: 'Menunggu GPS Siap!!',
            type: 'warning',
            showConfirmButton: false,
            allowOutsideClick: false
        });

        this.task = setInterval( async () =>  {
        
            let dataCoordinate = {
                date: moment().format('YYYY-MM-DD HH:mm:ss'),
                user_id: this.userdata.id,
                track_id: this.userDataProv.getSelectedTrack(),
                cluster_id: this.userDataProv.getSelectedClusterCode(),
                shift_id: this.shift_id,
                lat: this.lat,
                lng: this.long,
                acc: this.gpsAccuracy,
                speed: this.speed,
                unique_key: this.unique_key
            }

            if(!this.checkConnection) {
                this.MQTTconnect();
            }

            if(this.mqttStatus && this.gpsAccuracy <= this.settings.gpsAccuracy) {
                if(this.mqttStatus) {
                    await this.MQTTsend('v1/api/cluster', dataCoordinate);
                }

            }
            await this.pointProgress(dataCoordinate);
            await this.writeFileLog('T>'+JSON.stringify(dataCoordinate));
                     
        }, this.settings.intervalTracking);
    }

    ionViewDidLeave() {
        this.client.disconnect();
    }

    MQTTconnect() {
        let reconnectTimeout = 1000;
        this.client = new Paho.MQTT.Client(
            this.mqttData.host,
            Number(this.mqttData.port),
            this.mqttData.clientId  //Client Id
        );
        //callabacks
        this.client.onConnectionLost = this.onConnectionLost;
        this.client.onMessageArrived = this.onMessageArrived(this);
        var options = {
            timeout: reconnectTimeout,
            useSSL: this.mqttData.ssl,
            onSuccess: this.onConnect(this),
            reconnect: true,
            onFailure: this.doFail(this)
        };
        this.client.connect(options);
    };

    onConnect(callback) {
        return function () {
            callback.mqttStatus = true;
            callback.MQTTmonitor();
            callback.sendLog('MQTT Connected');
        }
    }

    doFail(callback) {
        return function () {
            callback.mqttStatus = false;
            callback.sendLog('MQTT connection failed');
            callback.MQTTconnect();
        }
    }

    async onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            await this.sendLog('MQTT lost connection');
        }
    }

    onMessageArrived(callback) {
        return function(message) {
        //     callback.sendLog("MQTT received checkpoint: " + message.payloadString);
        //     callback.currentCheckpointDescription = message.payloadString;
        //     if(!callback.checkpointCounter.includes(message.payloadString)) {
        //         callback.checkpointCounter.push(message.payloadString);
        //     }

        //     if(Object.keys(callback.checkpointData).length <=  Object.keys(callback.checkpointCounter).length && 
        //     Object.keys(callback.checkpointData).length <= message.payloadString) {
        //         callback.patroliFinish();
        //     }
        }
    }

    startGPSTracking() {

        this.watch = this.geolocation.watchPosition({
            enableHighAccuracy: true,
            timeout: Infinity,
            maximumAge: 0
        });

        this.watch.subscribe((data) => {
            if (typeof data.coords !== 'undefined') {
                if (data.coords.accuracy <= 30) {
                    if (this.flagNotifHome == false) {
                        swal.close();
                        this.sendLog("GPS Ready");
                        this.flagNotifHome = true;
                        this.nativeAudio.play("mulai")
                    }

                    this.lat = data.coords.latitude;
                    this.long = data.coords.longitude;
                    this.gpsAccuracy = data.coords.accuracy;
                    this.speed = data.coords.speed;
                    this.gpsStatus = true;
                }
            }

        });
    }

    //megirim MqTT
    MQTTsend(topic, mess) {
        let message = new Paho.MQTT.Message(JSON.stringify(mess));
        message.destinationName = topic;

        if (this.client.isConnected()) {
            this.client.send(message);
        } else {
            this.MQTTconnect();
        }
    }

    MQTTmonitor() {
        // this.client.subscribe(this.unique_key);
    }

    report() {
        this.navCtrl.push(ReportPage);
    }

    stop() {
        swal({
            title: 'Anda yakin ingin stop patroli anda ?',
            text: "",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Iya'
        }).then((result) => {

            if (result.value === true) {
                this.logoutAction();
            }
        })
    }

    getCheckpointData(): any {
        this.checkpointData = this.userDataProv.getCoordinates(this.userDataProv.getSelectedClusterCode());
        this.currentCheckpointDescription = this.checkpointData[0]['description'];
    }

    getDateTime(): string {
        return moment().format('YYYY-MM-DD HH:mm:ss').toString();
    }

    async logoutAction() {
        this.mqttStatus = false;
        if (this.client.isConnected()) {
            this.client.disconnect();
        }
        await this.sendLog('User stop application');
        await this.uploadFileLog();
        await this.removeFileLog();
        this.nativeAudio.play("selesai")
        setTimeout(() => {
            this.platform.exitApp();
        }, 3500)
    }

    sendLog(section, data = null) {
        console.log('=== LOG >' + moment().format('YYYY-MM-DD HH:mm:ss') + ' => ' + section);
        return new Promise( resolve => {
            resolve(this.writeFileLog('L>' + moment().format('YYYY-MM-DD HH:mm:ss') + '=>' + section));
        });
    }

    createFileLog(filename) {
        this.fileLogs = filename;
        this.sendLog('Create File log : ' + filename);
        return new Promise(resolve => {
            resolve(this.file.createFile(this.file.externalDataDirectory, this.fileLogs, true));
        });
    }

    writeFileLog(data) {
        return new Promise(resolve => {
            resolve(this.file.writeFile(this.file.externalDataDirectory, this.fileLogs, data + "\n", {replace: false, append: true}))
        })
        
    }
    
    removeFileLog() {
        return new Promise(resolve => {
            resolve(this.file.removeFile(this.file.externalDataDirectory, this.fileLogs));
        })
    }

    uploadFileLog() {
        return new Promise((resolve, reject) => {
            const fileTransfer: FileTransferObject = this.transfer.create();
            let options: FileUploadOptions = {
                fileKey: 'log',
                fileName: this.fileLogs,
                headers: {},
                params : {
                    'fileKey': 'log',
                    'fileName': this.fileLogs}
            };

            fileTransfer.upload(this.file.externalDataDirectory + this.fileLogs, this.host + '/upload_log', options)
            .then((data) => {
                resolve('success');
            }, (err) => {
                swal({
                    title: 'Info!',
                    text: 'Gagal Mengirim file log, periksa koneksi dan coba lagi',
                    type: 'info',
                    confirmButtonText: 'Ok'
                })
                this.sendLog('gagal kirim file log / tidak ada koneksi ' + err.exception);
                reject('gagal kirim file log');
            })
        })
    }

    checkConnection() : boolean{
        if (this.network.type == "none") {
              return false;
        } else {
            return true;
        }
    }

    patroliFinish() {
        this.mqttStatus = false;
        if (this.client.isConnected()) {
            this.client.disconnect();
        }
        swal({
            title: 'Pemberitahuan',
            text: 'Patroli Anda telah selesai, terimakasih',
            type: 'success',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ok'
        }).then((result) => {
            if (result.value === true) {
                this.logoutAction();
            }
        })
    }

    betweenDistance(lat1, lng1, lat2, lng2): number {

        var R = 6371; // Radius of the earth in km
        var dLat =  (Math.PI / 180) * (lat2 - lat1);  // deg2rad below
        var dLon =  (Math.PI / 180) * (lng2 - lng1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((Math.PI / 180) * (lat1)) * Math.cos((Math.PI / 180) * (lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        d = d * 1000 // on meter
        return d;
        
    }

    isCheckpoint(lat1, lng1, lat2, lng2): boolean {

        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = this.deg2rad(lng2 - lng1);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        d = d * 1000 // on meter
        var tempString: string;
        this.distance = d.toString();
        // return d;
        if (d < this.settings.radiusCheckpoint) {
            return true;
        } else {
            return false;
        }
    }

    deg2rad(deg): number {
        return deg * (Math.PI / 180)
    }

    async pointProgress(dataCoordinate) {
        var i: number;
        if (this.isFinish == false) {
            for (i = 0; i < Object.keys(this.checkpointData).length; i++) {
                
                if (this.isCheckpoint(dataCoordinate.lat, dataCoordinate.lng, this.checkpointData[i]['latitude'], this.checkpointData[i]['longitude'])) {

                    if (Object.keys(this.userCheckpoint).length >= Object.keys(this.checkpointData).length) {
                        this.isFinish = true;
                        await this.sendLog('berhasil Finish');

                        await swal({
                            title: 'Pemberitahuan',
                            text: 'Patroli Anda telah selesai, terimakasih',
                            type: 'success',
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Ok'
                        }).then((result) => {
                            if (result.value === true) {
                                // status
                                // this.http.post(this.host + '/patroli/status', statusData, {headers: { 'Content-Type': 'application/json' }});
                                this.logoutAction();
                            }
                        })
                        break;

                    } else {
                        if (this.userCheckpoint.indexOf(i) <= -1) {
                            this.userCheckpoint.push(i);
                            await this.sendLog('berhasil Checkpoint : ' + this.checkpointData[i]['description']);
                            this.nativeAudio.play(`point${i+1}`)
                        }
                        this.currentCheckpointDescription = this.checkpointData[i]['description'];
                        if (i+1 == Object.keys(this.checkpointData).length) {
                            this.nativeAudio.play("finish")
                        }
                        // this.currentCheckpoint = i;

                    }
                }
            }
        }
    }

}


// import { CheckversionPage } from './../checkversion/checkversion';
// import { Component } from '@angular/core';
// import { IonicPage, NavController, NavParams, Events, Platform, LoadingController } from 'ionic-angular';
// import { Geolocation } from '@ionic-native/geolocation';
// import { ReportPage } from '../report/report';
// import { HomePage } from '../home/home';
// import { BackgroundMode } from '@ionic-native/background-mode';
// import { UserDataProvider } from '../../providers/user-data/user-data';
// import { HttpClient } from '@angular/common/http';
// import { LocalNotifications } from '@ionic-native/local-notifications';
// import moment from 'moment';
// import swal from 'sweetalert2';
// import { Network } from '@ionic-native/network';
// import { delay } from 'rxjs/operator/delay';
// import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
// import { Storage } from '@ionic/storage'; //import storage untuk menyimpan data
// import { File } from '@ionic-native/file';
// import { NativeAudio } from '@ionic-native/native-audio';

// import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

// declare var Paho: any;

// @IonicPage()
// @Component({
//     selector: 'page-checkpoint',
//     templateUrl: 'checkpoint.html',
// })

// export class CheckpointPage {
//     list: any[];

//     mqttStatus: boolean;
//     gpsStatus: boolean;
//     clusterName: string;
//     clusterCode: string;
//     guardName: string;
//     client: any;
//     mqttData: any;
//     devices: any[] = [];
//     statusMessage: string;
//     zone: any;
//     userdata: any;
//     nextBeaconID: any;
//     nextBeaconDescription: any;
//     nextCheckpointId: any;
//     host: string;
//     imageTransfer: string;
//     blink: string;
//     blickFlag: boolean;
//     trackName: string;
//     watch: any;
//     watchSubscribe: any;
//     flagNotifHome: boolean;
//     datas: any[];
//     checkpoint: any[];
//     checkpointData: any[];
//     currentCheckpoint: number;
//     currentCheckpointDescription: string;
//     distance: any;
//     trackId: string;
//     lat: any;
//     long: any;
//     tempLat: any;
//     tempLong: any;
//     gpsAccuracy: any;
//     fileLogs: string;

//     //notif koneksi dan gps
//     koneksi: string;
//     gps: string;
//     kondisi: boolean;
//     shift_id: string;
//     unique_key: string;
//     speed: any;

//     //time
//     private comment: any;
//     private comment1: any;
//     private startTime: any;
//     private endTime: any;
//     private task: number;
//     private checkGPS: number;
//     private pulseClock: number;
//     private sendDataLocal: number;
//     private datecaptionstart: string;
//     private datecaptionend: string;
//     private nowDate: string;
//     private inumber: number = 0;
//     private settings: any;
//     private isFinish: boolean;

//     private mapUrl: SafeUrl;
//     private promise: Promise<string>;
//     private checkpointCounter = [];
//     private trackingStatus: boolean;
//     private startCheckpoint: boolean;
//     private userCheckpoint: Array<number>;

//     constructor(
//         private transfer: FileTransfer,
//         private file: File,
//         private storage: Storage, //deklarasi apabila data gagal di kirim
//         private localNotifications: LocalNotifications,
//         private http: HttpClient,
//         private userDataProv: UserDataProvider,
//         public events: Events,
//         public backgroundMode: BackgroundMode,
//         private geolocation: Geolocation,
//         public navCtrl: NavController,
//         public navParams: NavParams,
//         private network: Network,
//         //audio
//         private nativeAudio: NativeAudio,
//         //loading
//         public loadingCtrl: LoadingController,
//         public platform: Platform,
//         protected _sanitizer: DomSanitizer) {
//         moment.locale('id'); //test moment
//         this.userdata = this.userDataProv.getUser();
//         this.guardName = this.userdata.name;
//         this.nextBeaconID = this.userdata.next_beacon_id;
//         this.nextBeaconDescription = this.userdata.next_beacon_description;
//         this.nextCheckpointId = this.userdata.checkpoint_id;
//         this.clusterName = this.userDataProv.getSelectedCluster();
//         this.clusterCode = this.userDataProv.getSelectedClusterCode();
//         this.trackName = this.userDataProv.getSelectedTrackName();
//         this.trackId = this.userDataProv.getSelectedTrack();
//         this.settings = this.userDataProv.getSetting();
//         this.currentCheckpointDescription = '';
//         this.currentCheckpoint = 0;
//         this.host = this.userDataProv.getHost();
//         this.mqttStatus = false;
//         this.trackingStatus = false;
//         this.startCheckpoint = false;
//         this.mapUrl = this._sanitizer.bypassSecurityTrustResourceUrl('http://guardtour.alam-sutera.com/cluster/' + this.clusterCode + '/webview');
//         this.fileLogs = '';
//         this.mqttData = {
//             host: '43.251.98.16',
//             currentTopic: 'api',
//             ssl: false,
//             port: 8083,
//             clientId: 'uid-' + Math.floor(Math.random() * 100),
//             cleanSession: false,
//         };

//         this.userDataProv.setPatrol({ start: this.getDateTime() });
//         let patrolId = this.userDataProv.getPatrol();
//         this.shift_id = patrolId.shift_id;
//         this.unique_key = patrolId.unique_key;
//         this.datas = new Array();
//         this.startTime = new Date();
//         this.userCheckpoint = new Array(0);
//         this.isFinish = false;

//     }

//     ionViewDidLoad() { 
//         this.platform.ready().then(() => {
//             //  'trackID' can be anything
//             this.nativeAudio.preloadComplex('trackID', 'assets/audio/akurasiBuruk.mp3', 1, 1, 6).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             this.nativeAudio.preloadSimple('akurasiBuruk', 'assets/audio/akurasiBuruk.mp3').then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('finish', 'assets/audio/finish.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });


//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('selesai', 'assets/audio/selesai.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('tunggu', 'assets/audio/tunggu.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point1', 'assets/audio/1.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('mulai', 'assets/audio/mulai.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point2', 'assets/audio/2.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point3', 'assets/audio/3.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point4', 'assets/audio/4.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point5', 'assets/audio/5.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point6', 'assets/audio/6.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point7', 'assets/audio/7.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point8', 'assets/audio/8.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point9', 'assets/audio/9.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point10', 'assets/audio/10.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point11', 'assets/audio/11.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point12', 'assets/audio/12.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point13', 'assets/audio/13.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point14', 'assets/audio/15.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point15', 'assets/audio/15.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });


//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point16', 'assets/audio/16.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point17', 'assets/audio/17.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point18', 'assets/audio/18.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point19', 'assets/audio/19.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });

//             // 'trackID' can be anything
//             this.nativeAudio.preloadComplex('point20', 'assets/audio/20.mp3', 1, 1, 0).then(function () {
//                 console.log("audio loaded!");
//             }, function (err) {
//                 console.log("audio failed: " + err);
//             });
//             this.getCheckpointData();
//             this.initial(); 
//         }); 
//     }

//     async initial() {
//         await this.createFileLog(this.unique_key + '.logs');
//         await this.sendLog('Platform Ready');
//         await this.sendLog('settings ' + JSON.stringify(this.settings));
//         await this.sendLog('Waiting GPS to Ready');
//         this.trackingStart();
//         this.startGPSTracking();
//     }

//     trackingStart(){
//         this.MQTTconnect();
//         this.flagNotifHome = false;
//         this.datecaptionstart = moment(this.startTime).format('D-M-Y HH:mm:ss');
//         this.nativeAudio.play("tunggu")
     
//         swal({
//             title: 'Warning !',
//             text: 'Menunggu GPS Siap!!',
//             type: 'warning',
//             showConfirmButton: false,
//             allowOutsideClick: false
//         });

//         this.task = setInterval( async () =>  {
        
//             let dataCoordinate = {
//                 date: moment().format('YYYY-MM-DD HH:mm:ss'),
//                 user_id: this.userdata.id,
//                 track_id: this.userDataProv.getSelectedTrack(),
//                 cluster_id: this.userDataProv.getSelectedClusterCode(),
//                 shift_id: this.shift_id,
//                 lat: this.lat,
//                 lng: this.long,
//                 acc: this.gpsAccuracy,
//                 speed: this.speed,
//                 unique_key: this.unique_key
//             }

//             if(!this.checkConnection) {
//                 this.MQTTconnect();
//             }

//             if(this.mqttStatus && this.gpsAccuracy <= this.settings.gpsAccuracy) {
//                 if(this.mqttStatus) {
//                     await this.MQTTsend('v1/api/cluster', dataCoordinate);
//                 }
//                 await this.pointProgress(dataCoordinate);


//             }
            
//             await this.writeFileLog('T>'+JSON.stringify(dataCoordinate));
                     
//         }, this.settings.intervalTracking);
//     }

//     ionViewDidLeave() {
//         this.client.disconnect();
//     }

//     MQTTconnect() {
//         let reconnectTimeout = 1000;
//         this.client = new Paho.MQTT.Client(
//             this.mqttData.host,
//             Number(this.mqttData.port),
//             this.mqttData.clientId  //Client Id
//         );
//         //callabacks
//         this.client.onConnectionLost = this.onConnectionLost;
//         this.client.onMessageArrived = this.onMessageArrived(this);
//         var options = {
//             timeout: reconnectTimeout,
//             useSSL: this.mqttData.ssl,
//             onSuccess: this.onConnect(this),
//             reconnect: true,
//             onFailure: this.doFail(this)
//         };
//         this.client.connect(options);
//     };

//     onConnect(callback) {
//         return function () {
//             callback.mqttStatus = true;
//             callback.MQTTmonitor();
//             callback.sendLog('MQTT Connected');
//         }
//     }

//     doFail(callback) {
//         return function () {
//             callback.mqttStatus = false;
//             callback.sendLog('MQTT connection failed');
//             callback.MQTTconnect();
//         }
//     }

//     async onConnectionLost(responseObject) {
//         if (responseObject.errorCode !== 0) {
//             await this.sendLog('MQTT lost connection');
//         }
//     }

//     onMessageArrived(callback) {
//         return function(message) {
//         //     callback.sendLog("MQTT received checkpoint: " + message.payloadString);
//         //     callback.currentCheckpointDescription = message.payloadString;
//         //     if(!callback.checkpointCounter.includes(message.payloadString)) {
//         //         callback.checkpointCounter.push(message.payloadString);
//         //     }

//         //     if(Object.keys(callback.checkpointData).length <=  Object.keys(callback.checkpointCounter).length && 
//         //     Object.keys(callback.checkpointData).length <= message.payloadString) {
//         //         callback.patroliFinish();
//         //     }
//         }
//     }

//     startGPSTracking() {

//         this.watch = this.geolocation.watchPosition({
//             enableHighAccuracy: true,
//             timeout: Infinity,
//             maximumAge: 0
//         });

//         this.watch.subscribe((data) => {
//             if (typeof data.coords !== 'undefined') {
//                 if (data.coords.accuracy <= 30) {
//                     if (this.flagNotifHome == false) {
//                         swal.close();
                        
//                         this.sendLog("GPS Ready");
//                         this.flagNotifHome = true;
//                         setTimeout(() => {
//                             this.nativeAudio.play("mulai")
//                         }, 3000)
//                     }
                    
//                     this.lat = data.coords.latitude;
//                     this.long = data.coords.longitude;
//                     this.gpsAccuracy = data.coords.accuracy;
//                     this.speed = data.coords.speed;
//                     this.gpsStatus = true;
//                 }
//             }

//         });
//     }

//     //megirim MqTT
//     MQTTsend(topic, mess) {
//         let message = new Paho.MQTT.Message(JSON.stringify(mess));
//         message.destinationName = topic;

//         if (this.client.isConnected()) {
//             this.client.send(message);
//         } else {
//             this.MQTTconnect();
//         }
//     }

//     MQTTmonitor() {
//         // this.client.subscribe(this.unique_key);
//     }

//     report() {
//         this.navCtrl.push(ReportPage);
//     }

//     stop() {
//         swal({
//             title: 'Anda yakin ingin stop patroli anda ?',
//             text: "",
//             type: 'warning',
//             showCancelButton: true,
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Iya'
//         }).then((result) => {

//             if (result.value === true) {
//                 this.logoutAction();
//             }
//         })
//     }

//     getCheckpointData(): any {
//         this.checkpointData = this.userDataProv.getCoordinates(this.userDataProv.getSelectedClusterCode());
//         this.currentCheckpointDescription = this.checkpointData[0]['description'];
//     }

//     getDateTime(): string {
//         return moment().format('YYYY-MM-DD HH:mm:ss').toString();
//     }

//     async logoutAction() {
//         this.mqttStatus = false;
//         if (this.client.isConnected()) {
//             this.client.disconnect();
//         }
//         await this.sendLog('User stop application');
//         await this.uploadFileLog();
//         await this.removeFileLog();
//         setTimeout(() => {
//             this.platform.exitApp();

//         }, 3500)
//     }

//     sendLog(section, data = null) {
//         console.log('=== LOG >' + moment().format('YYYY-MM-DD HH:mm:ss') + ' => ' + section);
//         return new Promise( resolve => {
//             resolve(this.writeFileLog('L>' + moment().format('YYYY-MM-DD HH:mm:ss') + '=>' + section));
//         });
//     }

//     createFileLog(filename) {
//         this.fileLogs = filename;
//         this.sendLog('Create File log : ' + filename);
//         return new Promise(resolve => {
//             resolve(this.file.createFile(this.file.externalDataDirectory, this.fileLogs, true));
//         });
//     }

//     writeFileLog(data) {
//         return new Promise(resolve => {
//             resolve(this.file.writeFile(this.file.externalDataDirectory, this.fileLogs, data + "\n", {replace: false, append: true}))
//         })
        
//     }
    
//     removeFileLog() {
//         return new Promise(resolve => {
//             resolve(this.file.removeFile(this.file.externalDataDirectory, this.fileLogs));
//         })
//     }

//     uploadFileLog() {
//         return new Promise((resolve, reject) => {
//             const fileTransfer: FileTransferObject = this.transfer.create();
//             let options: FileUploadOptions = {
//                 fileKey: 'log',
//                 fileName: this.fileLogs,
//                 headers: {},
//                 params : {
//                     'fileKey': 'log',
//                     'fileName': this.fileLogs}
//             };

//             fileTransfer.upload(this.file.externalDataDirectory + this.fileLogs, this.host + '/upload_log', options)
//             .then((data) => {
//                 resolve('success');
//             }, (err) => {
//                 swal({
//                     title: 'Info!',
//                     text: 'Gagal Mengirim file log, periksa koneksi dan coba lagi',
//                     type: 'info',
//                     confirmButtonText: 'Ok'
//                 })
//                 this.sendLog('gagal kirim file log / tidak ada koneksi ' + err.exception);
//                 reject('gagal kirim file log');
//             })
//         })
//     }

//     checkConnection() : boolean{
//         if (this.network.type == "none") {
//               return false;
//         } else {
//             return true;
//         }
//     }

//     patroliFinish() {
//         // this.mqttStatus = false;
//         // if (this.client.isConnected()) {
//         //     this.client.disconnect();
//         // }
//         swal({
//             title: 'Pemberitahuan',
//             text: 'Patroli Anda telah selesai, terimakasih',
//             type: 'success',
//             confirmButtonColor: '#3085d6',
//             cancelButtonColor: '#d33',
//             confirmButtonText: 'Ok'
//         }).then((result) => {
//             if (result.value === true) {
//                 this.nativeAudio.play("selesai")
//                 this.logoutAction();

//             }
//         })
//     }

//     betweenDistance(lat1, lng1, lat2, lng2): number {

//         var R = 6371; // Radius of the earth in km
//         var dLat =  (Math.PI / 180) * (lat2 - lat1);  // deg2rad below
//         var dLon =  (Math.PI / 180) * (lng2 - lng1);
//         var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((Math.PI / 180) * (lat1)) * Math.cos((Math.PI / 180) * (lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
//         var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         var d = R * c; // Distance in km
//         d = d * 1000 // on meter
//         return d;
        
//     }

//     isCheckpoint(lat1, lng1, lat2, lng2): boolean {

//         var R = 6371; // Radius of the earth in km
//         var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
//         var dLon = this.deg2rad(lng2 - lng1);
//         var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
//         var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//         var d = R * c; // Distance in km
//         d = d * 1000 // on meter
//         var tempString: string;
//         this.distance = d.toString();
//         // return d;
//         if (d < this.settings.radiusCheckpoint) {
//             return true;
//         } else {
//             return false;
//         }
//     }

//     deg2rad(deg): number {
//         return deg * (Math.PI / 180)
//     }

//     async pointProgress(dataCoordinate) {
//         var i: number;
//         if (this.isFinish == false) {
//             for (i = 0; i < Object.keys(this.checkpointData).length; i++) {
                
//                 if (this.isCheckpoint(dataCoordinate.lat, dataCoordinate.lng, this.checkpointData[i]['latitude'], this.checkpointData[i]['longitude'])) {

//                     if (Object.keys(this.userCheckpoint).length >= Object.keys(this.checkpointData).length) {
//                         this.isFinish = true;
//                         await this.sendLog('berhasil Finish');
                        
//                         this.patroliFinish()
//                         // setTimeout(() => {
//                         // }, 5000)
//                         break;

//                     } else {
//                         if (this.userCheckpoint.indexOf(i) <= -1) {
//                             // setTimeout(() => {
//                                 // }, 3000)
//                                 this.userCheckpoint.push(i);
//                                 await this.sendLog('berhasil Checkpoint : ' + this.checkpointData[i]['description']);
//                                 if(i+1 != Object.keys(this.checkpointData).length) {
//                                     this.nativeAudio.play(`point${i+1}`)
//                                 }else {
//                                     this.nativeAudio.play(`finish`)

//                                 }
//                         }
//                         this.currentCheckpointDescription = this.checkpointData[i]['description'];
//                         // this.currentCheckpoint = i;

//                     }
//                 }
//             }
//         }
//     }

// }