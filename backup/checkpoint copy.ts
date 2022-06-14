import { CheckversionPage } from './../checkversion/checkversion';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, Platform, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { ReportPage } from '../report/report';
import { SummaryPage } from '../summary/summary';
import { BackgroundMode } from '@ionic-native/background-mode';
import { UserDataProvider } from '../../providers/user-data/user-data';
import { HttpClient } from '@angular/common/http';
import { LocalNotifications } from '@ionic-native/local-notifications';
import moment from 'moment';
import swal from 'sweetalert2';
import { Network } from '@ionic-native/network';
import { delay } from 'rxjs/operator/delay';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

//audio
import { NativeAudio } from '@ionic-native/native-audio';

import { Storage } from '@ionic/storage'; //import storage untuk menyimpan data

declare var Paho: any;


@IonicPage()
@Component({
    selector: 'page-checkpoint',
    templateUrl: 'checkpoint.html',
})

export class CheckpointPage {
    list: any[];

    error: any;
    mqttStatusCaption: string;
    mqttStatus: boolean;
    gpsStatusCaption: string;
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
    imageGPS: string;
    imageConnection: string;
    imageTransfer: string;
    blink: string;
    blickFlag: boolean;
    trackStatus: boolean;
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
    gpsAccuracy: any;
    trackId: string;

    //lat,long
    lat: any;
    long: any;

    //notif koneksi dan gps
    koneksi: string;
    gps: string;
    kondisi: boolean;
    shift_id: string;
    unique_key: string;
    isDevice: boolean;

    //azwarspeed
    speed: any;

    //time
    private comment: any;
    private comment1: any;
    private startTime: any;
    private endTime: any;
    private task: number;
    private datecaptionstart: string;
    private datecaptionend: string;
    private inumber: number = 0;

    //link maps
    azwarRouteMaps: string;
    private mapUrl: SafeUrl;

    //wfh settimer
    // timerSendData: any=60000;

    constructor(
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
        this.mqttStatusCaption = 'not connected';
        this.gpsStatusCaption = 'finding location...';
        this.imageGPS = 'assets/imgs/gps-off.png';
        this.imageConnection = 'assets/imgs/network-off.png';
        this.currentCheckpoint = 0;

        this.userdata = this.userDataProv.getUser();
        this.guardName = this.userdata.name;
        this.nextBeaconID = this.userdata.next_beacon_id;
        this.nextBeaconDescription = this.userdata.next_beacon_description;
        this.nextCheckpointId = this.userdata.checkpoint_id;
        this.clusterName = this.userDataProv.getSelectedCluster();
        this.clusterCode = this.userDataProv.getSelectedClusterCode();
        this.trackName = this.userDataProv.getSelectedTrackName();
        this.trackId = this.userDataProv.getSelectedTrack();
        this.currentCheckpointDescription = '';
        this.host = this.userDataProv.getHost();
        this.isDevice = this.platform.is('cordova');
        this.mqttStatus = true;
        this.mapUrl = this._sanitizer.bypassSecurityTrustResourceUrl('http://guardtour.alam-sutera.com/cluster/' + this.clusterCode + '/webview');


        this.mqttData = {
            // host: '209.97.168.161',
            host: '43.251.98.16',
            // username: 'psuyddse', 
            // password: '0LFWtA334Zyy',
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


        //time
        this.startTime = new Date();
        this.task = setInterval(() => {
            this.updateTime();
        }, 1000);

        //wfh kirim waktu
        this.task = setInterval(() => {
            this.kirimDataPatroli();
        }, 60000); //parameter waktu kirim data

        //suara
        this.platform.ready().then(() => {
            console.log("platform ready");

            // This is used to unload the track. It's useful if you're experimenting with track locations
            this.nativeAudio.unload('trackID').then(function () {
                console.log("unloaded audio!");
            }, function (err) {
                console.log("couldn't unload audio... " + err);
            });

            // 'trackID' can be anything
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
        });

    }

    //update time
    updateTime() {
        let endTime = new Date();
        let diff = moment(endTime).diff(this.startTime);
        let d = moment.duration(diff);
        let hours = Math.floor(d.asHours());
        let minutes = moment.utc(diff).format("mm");
        let detik = moment.utc(diff).format("ss");
        this.datecaptionstart = moment(this.startTime).format('D-M-Y HH:mm:ss');
        this.datecaptionend = moment(endTime).format('D-M-Y HH:mm:ss');
        this.comment = hours + " hours " + minutes + " minutes " + detik + " detik";
        // console.log('=== LOG === Update Time');
    }

    ionViewDidLoad() {
        this.flagNotifHome = false;

        this.azwarRouteMaps="http://guardtour.alam-sutera.com/cluster/105/webview";

        this.nativeAudio.play('tunggu').then(function () {
            console.log("playing audio!");
            // this.stopSuara();

        }, function (err) {
            console.log("error playing audio: " + err);
        });



        //show popup
        swal({
            title: 'Warning !',
            text: 'Menunggu GPS Siap!!',
            type: 'warning',
            showConfirmButton: false,
            allowOutsideClick: false
        })

        this.checkpoint = this.getCheckpointData();
        this.MQTTconnect();
    }

    ionViewWillEnter() {
        // this.MQTTconnect();

        //azwar notif
        //  console.log('Azwar gps akurasi : ' + this.gpsAccuracy);
        //  if (this.gpsAccuracy >= 10 || this.gpsAccuracy == 'undefined') {
        //      this.testSuara();
        //  }
    }

    ionViewDidEnter() {
        //this.client.end();

        //azwar notif
        // console.log('Azwar gps akurasi : ' + this.gpsAccuracy);
        if (this.gpsAccuracy >= 10 || this.gpsAccuracy == 'undefined') {
            this.testSuara();
        }
    }

    ionViewDidLeave() {
        this.client.disconnect();
        //this.watch.unsubscribe();
    }

    MQTTconnect() {
        let reconnectTimeout = 2000;
        console.log("START");
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
            onSuccess: this.onConnect(this),
            onFailure: this.doFail
        };
        console.log("TXSS", options);
        this.client.connect(options);
    };

    onConnect(callback) {
        this.kondisi = true;
        return function () {
            callback.mqttStatusCaption = 'OK';
            callback.imageConnection = 'assets/imgs/network-on.png';
            callback.startGPSTracking();
            console.log("MQTT CONNECT");
        }

    }

    doFail(e) {
        this.error = e;
        this.imageGPS = 'assets/imgs/gps-off.png';
        this.imageConnection = 'assets/imgs/network-off.png';
    }

    onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        } else {
            this.imageConnection = 'assets/imgs/network-off.png';
            this.imageGPS = 'assets/imgs/gps-off.png';
        }
    }

    onMessageArrived(message) {
        console.log(message.payloadString);
    }

    cachingData(dataCoordinate) {

        //check point by coordinate
        // let dataPush = {
        //     user_id: this.userdata.id,
        //     track_id: this.trackId,
        //     cluster_id: this.userDataProv.getSelectedClusterCode(),
        //     unique_key: this.unique_key,
        //     type: 0, // movement
        //     pointid: 0,
        //     date: this.getDateTime(),
        //     data : dataCoordinate
        // }
        // this.datas.push(dataPush);


        if (this.isCheckpoint(dataCoordinate.lat, dataCoordinate.lng, this.checkpointData[this.currentCheckpoint]['latitude'], this.checkpointData[this.currentCheckpoint]['longitude'])) {
            let dataPush = {
                user_id: this.userdata.id,
                track_id: this.trackId,
                cluster_id: this.userDataProv.getSelectedClusterCode(),
                unique_key: this.unique_key,
                type: 1, //checkpoint
                point_id: this.currentCheckpoint,
                date: this.getDateTime(),
                data: this.isCheckpoint(dataCoordinate.lat, dataCoordinate.lng, this.checkpointData[this.currentCheckpoint]['latitude'], this.checkpointData[this.currentCheckpoint]['longitude'])
            };
            this.datas.push(dataPush);

            let clusterid = this.userDataProv.getSelectedClusterCode();

            let dataPushAzwar = {
                user_id: this.userdata.id,
                track_id: this.trackId,
                cluster_id: this.userDataProv.getSelectedClusterCode(),
                unique_key: this.unique_key,
                type: 1, // movement
                point_id: this.currentCheckpoint + 1,
                date: this.getDateTime(),
                data: this.isCheckpoint(dataCoordinate.lat, dataCoordinate.lng, this.checkpointData[this.currentCheckpoint]['latitude'], this.checkpointData[this.currentCheckpoint]['longitude'])
            }

            //push data checkpoint
            // var link = this.host + '/checkpoint/progress';
            // var myData = JSON.stringify(dataPush);
            // this.http.post(link, myData, { headers: { 'Content-Type': 'application/json' } });
            //  //push data checkpoint
            var link = this.host + '/checkpoint/progress';
            var myData = JSON.stringify(dataPushAzwar);
            this.http.post(link, myData, { headers: { 'Content-Type': 'application/json' } }).subscribe(result => {
                let dataObject: any;
                dataObject = result;
                console.log('Hasilnya ' + dataObject);
                // swal({
                //     title: 'Error!',
                //     text: JSON.stringify(dataObject.message),
                //     type: 'error',
                //     confirmButtonText: 'Ok'
                // })
                console.log('Isi data ke table point_progress ');
            }, error => {
                swal({
                    title: 'Error!',
                    text: JSON.stringify(error.message),
                    type: 'error',
                    confirmButtonText: 'Ok'
                })
                console.log('errornya : ' + error);
            });
            console.log('Isi data ke table point_progress ');

            //new cek position status
            // let dataPushPatrolStatus = {
            //     track_id: this.trackId,
            //     cluster_id: this.userDataProv.getSelectedClusterCode(),
            //     unique_key: this.unique_key,
            //     status: 0
            // }
            // var link = this.host + '/checkpoint/status';
            // var myData = JSON.stringify(dataPushPatrolStatus);
            // this.http.post(link, myData, { headers: { 'Content-Type': 'application/json' } }).subscribe(result => {
            //     let dataObject: any;
            //     dataObject = result;
            //     console.log('Hasilnya ' + dataObject);
            //     // swal({
            //     //     title: 'Error!',
            //     //     text: JSON.stringify(dataObject.message),
            //     //     type: 'error',
            //     //     confirmButtonText: 'Ok'
            //     // })
            //     console.log('Isi data ke table patrol_status ');
            // }, error => {
            //     swal({
            //         title: 'Error!',
            //         text: JSON.stringify(error.message),
            //         type: 'error',
            //         confirmButtonText: 'Ok'
            //     })
            //     console.log('errornya : ' + error);
            // });

            console.log('Isi currentcheckpoint : ' + this.currentCheckpoint);

            // if(this.currentCheckpoint!=1){
            //     this.nativeAudio.play('point'+this.currentCheckpoint).then(function () {
            //         console.log("playing audio!");
            //         // this.stopSuara();

            //     }, function (err) {
            //         console.log("error playing audio: " + err);
            //     });
            // }



            console.log('Isi Object.Keys: ' + Object.keys(this.checkpointData).length);
            console.log('Isi json description : ' + JSON.stringify(this.checkpointData));
            if (this.currentCheckpoint >= Object.keys(this.checkpointData).length - 1) {

                this.nativeAudio.play('finish').then(function () {
                    console.log("playing audio!");
                    // this.stopSuara();

                }, function (err) {
                    console.log("error playing audio: " + err);
                });

                // SEND PROGRESS FINISH
                setTimeout(() => {
                    let dataPushAzwar = {
                        user_id: this.userdata.id,
                        track_id: this.trackId,
                        cluster_id: this.userDataProv.getSelectedClusterCode(),
                        unique_key: this.unique_key,
                        type: 1, // movement
                        point_id: 'Finish',
                        date: this.getDateTime(),
                        data: this.isCheckpoint(dataCoordinate.lat, dataCoordinate.lng, this.checkpointData[this.currentCheckpoint]['latitude'], this.checkpointData[this.currentCheckpoint]['longitude'])
                    }

                    var link = this.host + '/checkpoint/progress';
                    var myData = JSON.stringify(dataPushAzwar);
                    this.http.post(link, myData, { headers: { 'Content-Type': 'application/json' } }).subscribe(result => {
                        let dataObject: any;
                        dataObject = result;
                        console.log('Hasilnya ' + dataObject);
                        // swal({
                        //     title: 'Error!',
                        //     text: JSON.stringify(dataObject.message),
                        //     type: 'error',
                        //     confirmButtonText: 'Ok'
                        // })
                        console.log('Isi data ke table point_progress ');
                    }, error => {
                        swal({
                            title: 'Error!',
                            text: JSON.stringify(error.message),
                            type: 'error',
                            confirmButtonText: 'Ok'
                        })
                        console.log('errornya : ' + error);
                    });
                }, 2000);



                //delay
                setTimeout(() => {
                    //new cek position status
                    let dataPushPatrolStatus = {
                        track_id: this.trackId,
                        cluster_id: this.userDataProv.getSelectedClusterCode(),
                        unique_key: this.unique_key,
                        status: 1
                    }
                    var link = this.host + '/checkpoint/status';
                    var myData = JSON.stringify(dataPushPatrolStatus);
                    this.http.post(link, myData, { headers: { 'Content-Type': 'application/json' } }).subscribe(result => {
                        let dataObject: any;
                        dataObject = result;
                        console.log('Hasilnya ' + dataObject);
                        // swal({
                        //     title: 'Error!',
                        //     text: JSON.stringify(dataObject.message),
                        //     type: 'error',
                        //     confirmButtonText: 'Ok'
                        // })
                        console.log('Isi data ke table patrol_status ');

                        //selesai patroli
                        this.nativeAudio.play('selesai').then(function () {
                            console.log("playing audio!");
                            // this.stopSuara();

                        }, function (err) {
                            console.log("error playing audio: " + err);
                        });
                    }, error => {
                        swal({
                            title: 'Error!',
                            text: JSON.stringify(error.message),
                            type: 'error',
                            confirmButtonText: 'Ok'
                        })
                        console.log('errornya : ' + error);
                    });
                }, 5000);

                this.mqttStatus = false;
                swal({
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

                //push data checkpoint
                // var link = this.host + '/checkpoint/progress';
                // var myData = JSON.stringify(dataPush);
                // this.http.post(link, myData, {headers: { 'Content-Type': 'application/json' }})

            } else {
                this.currentCheckpoint++;
                console.log('Current Point : ' + this.currentCheckpoint);
                this.currentCheckpointDescription = this.checkpointData[this.currentCheckpoint]['description'];

                //play audio
                if (this.currentCheckpoint != 1) {
                    this.nativeAudio.play('point' + this.currentCheckpoint).then(function () {
                        console.log("playing audio!");
                        // this.stopSuara();

                    }, function (err) {
                        console.log("error playing audio: " + err);
                    });
                }
            }


        }

    }

    test() {
        console.log("Cluster Id : " + this.userDataProv.getSelectedClusterCode());
        // let dataPush = {
        //     user_id: this.userdata.id,
        //     track_id: this.trackId,
        //     cluster_id: this.userDataProv.getSelectedClusterCode(),
        //     unique_key: this.unique_key,
        //     type: 1, //checkpoint
        //     point_id: this.currentCheckpoint,
        //     date: this.getDateTime(),
        //     data: 'dataCoordinate'
        // }

        // //  //push data checkpoint
        // var link = this.host + '/checkpoint/progress';
        // var myData = JSON.stringify(dataPush);
        // this.http.post(link, myData, { headers: { 'Content-Type': 'application/json' } }).subscribe(result => {
        //     let dataObject: any;
        //     dataObject = result;
        //     console.log('Hasilnya + ' + dataObject);
        // }, error => {
        //     swal({
        //         title: 'Error!',
        //         text: JSON.stringify(error.message),
        //         type: 'error',
        //         confirmButtonText: 'Ok'
        //     })
        //     console.log('errornya : ' + error);
        // });
        // console.log('Menjalankan tombol test');
    }

    //cek kordinat
    startGPSTracking() {

        this.watch = this.geolocation.watchPosition({
            enableHighAccuracy: true,
            timeout: 1000,
            maximumAge: 1000
        });

        this.watch.subscribe((data) => {
            if (typeof data.coords !== 'undefined') {
                if (data.coords.accuracy <= 30) {
                    if (this.flagNotifHome == false) {
                        swal.close();

                        //play audio start
                        this.nativeAudio.play('mulai').then(function () {
                            console.log("playing audio!");
                            // this.stopSuara();

                        }, function (err) {
                            console.log("error playing audio: " + err);
                        });

                        this.flagNotifHome = true;
                    }

                    this.gpsStatusCaption = 'OK';

                    let nowDate = moment().format('YYYY-MM-DD h:mm:ss');
                    let dataCoordinate = {
                        date: nowDate,
                        user_id: this.userdata.id,
                        track_id: this.userDataProv.getSelectedTrack(),
                        cluster_id: this.userDataProv.getSelectedClusterCode(),
                        shift_id: this.shift_id,
                        lat: data.coords.latitude,
                        lng: data.coords.longitude,
                        acc: data.coords.accuracy,
                        unique_key: this.unique_key
                    }
                    this.lat = data.coords.latitude;
                    this.long = data.coords.longitude;
                    var tempString: string;
                    this.gpsAccuracy = data.coords.accuracy.toString();
                    if (this.mqttStatus) {
                        this.MQTTsend('v1/api/cluster', dataCoordinate);
                        this.cachingData(dataCoordinate);
                    }
                    this.imageGPS = 'assets/imgs/gps-on.png';
                    this.trackStatus = true;
                    this.koneksi = 'Terhubung';
                    this.gps = 'GPS Terkoneksi';
                }
            } else {
                this.trackStatus = false;
                this.gpsStatusCaption = 'finding location...';
                this.imageGPS = 'assets/imgs/gps-off.png';
                this.koneksi = 'Terputus';
                this.gps = 'Terputus';
            }

            //stop

            // //azwar notif
            // console.log('Azwar gps akurasi : '+this.gpsAccuracy);
            // if(this.gpsAccuracy<=20){
            //     this.testSuara();
            //     swal.close();
            //     // this.stopSuara();
            // }
        });

    }

    //megirim MqTT
    MQTTsend(topic, mess) {
        let message = new Paho.MQTT.Message(JSON.stringify(mess));
        message.destinationName = topic;

        /**
         * kondisi untuk mengirim data apabila koneksi terputus
         *  
         **/
        if (this.client.isConnected()) {
            this.client.send(message);
            console.log("MQTT sent data at " + this.getDateTime());
            console.log(mess);
        } else {
            console.log("MQTT sent data fail at" + this.getDateTime());
            this.MQTTconnect();
        }
    }



    MQTTmonitor() {
        this.client.subscribe(this.mqttData.currentTopic);
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
                this.userDataProv.setPatrol({ end: this.getDateTime() }); //mendapatkan waktu stop
                this.mqttStatus = false;

                //new cek position status
                let dataPushPatrolStatus = {
                    track_id: this.trackId,
                    cluster_id: this.userDataProv.getSelectedClusterCode(),
                    unique_key: this.unique_key,
                    status: 0
                }
                var link = this.host + '/checkpoint/status';
                var myData = JSON.stringify(dataPushPatrolStatus);
                this.http.post(link, myData, { headers: { 'Content-Type': 'application/json' } }).subscribe(result => {
                    let dataObject: any;
                    dataObject = result;
                    console.log('Hasilnya ' + dataObject);
                    // swal({
                    //     title: 'Error!',
                    //     text: JSON.stringify(dataObject.message),
                    //     type: 'error',
                    //     confirmButtonText: 'Ok'
                    // })
                    console.log('Isi data ke table patrol_status ');
                }, error => {
                    swal({
                        title: 'Error!',
                        text: JSON.stringify(error.message),
                        type: 'error',
                        confirmButtonText: 'Ok'
                    })
                    console.log('errornya : ' + error);
                });




                this.logoutAction();
                // this.navCtrl.push(SummaryPage); //ke halaman yang di tuju
            }
        })
    }

    showMessage(text) {
        swal({
            title: 'Info!',
            text: text,
            type: 'info',
            confirmButtonText: 'Ok'
        })
    }

    getCheckpointData(): any {
        this.checkpointData = this.userDataProv.getCoordinates(this.userDataProv.getSelectedClusterCode());
        this.currentCheckpointDescription = this.checkpointData[1]['description'];
        console.log('test start : ');

        console.log('aaaaaa : ' + this.checkpointData);

        console.log(this.currentCheckpointDescription);
    }

    debug(obj) {
        swal({
            title: 'Debug!',
            text: JSON.stringify(obj),
            type: 'info',
            confirmButtonText: 'Ok'
        })
    }

    getDateTime(): string {
        return moment().format('YYYY-MM-DD H:mm:ss').toString();
    }

    // isCheckpoint(lat1,lng1,lat2,lng2): any {
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
        if (d < 15) {
            return true;
        } else {
            return false;
        }
    }

    deg2rad(deg): number {
        return deg * (Math.PI / 180)
    }

    logoutAction() {
        let isConnected = true;
        this.mqttStatus = false;

        if (this.isDevice) {
            let conntype = this.network.type;
            let isConnected = conntype && conntype !== 'unknown' && conntype !== 'none';
        }

        if (isConnected == true) {

            var link = this.host + '/user/logout';
            var myData = JSON.stringify({ username: this.guardName });

            this.http.post(link, myData, { headers: { 'Content-Type': 'application/json' } })
                .subscribe(result => {
                    let dataObj: any;
                    dataObj = result;

                    if (dataObj.status == true) { //user found
                        this.platform.exitApp();
                    } else {
                        swal({
                            title: 'Error !',
                            text: dataObj.message,
                            type: 'error',
                            confirmButtonText: 'Ok'
                        })
                    }
                }, error => {
                    swal({
                        title: 'Error!',
                        text: JSON.stringify(error.message),
                        type: 'error',
                        confirmButtonText: 'Ok'
                    })
                });

        } else {
            swal({
                title: 'Error!',
                text: 'No Connection',
                type: 'error',
                confirmButtonText: 'Ok'
            })
        }
    }

    //test suara
    testSuara() {
        console.log("playing audio");

        this.nativeAudio.play('point1').then(function () {
            console.log("playing audio!");
            // this.stopSuara();

        }, function (err) {
            console.log("error playing audio: " + err);
        });

        // this.nativeAudio.play('point1').then(function () {
        //     console.log("playing audio!");
        // }, function (err) {
        //     console.log("error playing audio: " + err);
        // });
        // this.nativeAudio.preloadComplex('uniqueId2', 'path/to/file2.mp3', 1, 1, 0).then(function, onError);
    }
    // stopSuara(){
    //     this.nativeAudio.stop('trackID').then(function () {
    //         console.log("stop audio!");
    //     }, function (err) {
    //         console.log("error stop audio: " + err);
    //     });
    // }

    //wfh membuat fitur save patroli menggunakan HTTP
    kirimDataPatroli() {

        // stack data
        let dataPatroli = {
            guard_id: this.userdata.id,
            track_id: this.trackId,
            unique_key: this.unique_key,
            attempts: 1,
            shift_id:"",
            geo_data: this.list
        };
        var myData = JSON.stringify(dataPatroli);

        

        //send data
        var link = this.host + '/patroli';
        this.http.post(link,myData,{ headers:{'Content-Type':'application/json'}}).subscribe(result=>{
            let dataObject: any;
            dataObject = result;
            console.log('Hasilnya ' + dataObject);
            this.storage.clear();
        },error=>{
            // swal({
            //     title: 'Error Data ',
            //     text: JSON.stringify(error.message),
            //     type: 'error',
            //     confirmButtonText: 'Ok'
            // })
            console.log('Error saat post data patroli : ' + error);
            this.azwarTestSql(myData);
        });
        console.log("Azwar Patroli : " + myData);
    }


    azwarTestSql(dataTemp) {
        // set a key/value
        this.storage.set('dataTemp', dataTemp);

        // Or to get a key/value pair
        this.storage.get('dataTemp').then((val) => {
            console.log('dataTemp', val);
        });
    }


}

