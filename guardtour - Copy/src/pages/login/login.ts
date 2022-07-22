import { CheckversionPage } from './../checkversion/checkversion';
import { PanicbuttonPage } from './../panicbutton/panicbutton';
import { PilihmenuPage } from './../pilihmenu/pilihmenu';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import { HomePage } from '../home/home';
import { ReportPage } from '../report/report';
import { UserDataProvider } from '../../providers/user-data/user-data';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Network } from '@ionic-native/network';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Device } from '@ionic-native/device';

import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';


@Injectable()
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage {

    userid: any;
    password: any;
    //nama cluster
    clustername: any;
    host: string;
    isDevice: boolean;
    uid: string;

    //versi
    versi:string='1.1.18';
    constructor(
      private localNotifications: LocalNotifications, 
      // private ble: BLE, 
      private network: Network, 
      private androidPermissions: AndroidPermissions, 
      private locationAccuracy: LocationAccuracy, 
      private backgroundMode: BackgroundMode, 
      private userdata: UserDataProvider, 
      private platform: Platform, 
      private http: HttpClient, 
      public navCtrl: NavController, 
      public navParams: NavParams,
      private device: Device,
      private transfer: FileTransfer,
      private file: File
      ) {

        this.uid = this.device.uuid;
        this.host = this.userdata.getHost();
        //handle back button
        this.isDevice = this.platform.is('cordova');
        console.log(this.isDevice)
        if (this.isDevice) {

            // this.backgroundInit();

            platform.ready().then(() => { 
                this.checkFileLog();
                this.locationAccuracy.canRequest().then((canRequest: boolean) => {

                    if(canRequest) {
                        // the accuracy option will be ignored by iOS
                        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
                          () => function() {
                              console.log('Request successful')
                          },
                          error => console.log('Error requesting location permissions', error)
                        );
                    }
                });

                platform.registerBackButtonAction(() => {
                    let view = this.navCtrl.getActive();
                    switch (view.component.name) {
                        case "LoginPage":
                            swal({
                              title: 'Anda yakin ingin shutdown aplikasi patroli anda?',
                              text: "",
                              type: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#3085d6',
                              cancelButtonColor: '#d33',
                              confirmButtonText: 'Iya'
                            }).then((result) => {
                              if (result.value === true) {
                                  this.platform.exitApp();
                              }
                            });
                            break;
                        case 'CheckpointPage':
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
                                this.navCtrl.push(LoginPage);
                              }
                            });
                            break;
                        case 'HomePage':
                            swal({
                              title: 'Anda yakin ingin logout?',
                              text: "",
                              type: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#3085d6',
                              cancelButtonColor: '#d33',
                              confirmButtonText: 'Iya'
                            }).then((result) => {
                              if (result.value === true) {
                                this.navCtrl.push(LoginPage);
                              }
                            });
                            break;
                    }

                });
            })
        }


  }


  ionViewDidLoad() {
    this.cekVersi();

  }

  ionViewDidEnter(){
      
  }

  backgroundInit(){
      this.backgroundMode.setDefaults({
            title: 'Alam Sutera',
            text: 'Guard Tour Application',
            icon: 'icon', // this will look for icon.png in platforms/android/res/drawable|mipmap
            color: 'F14F4D', // hex format like 'F14F4D'
            resume: true,
            hidden: false,
            bigText: false
        })

        if (!this.backgroundMode.isActive()) {
            this.backgroundMode.enable();
        };

        this.backgroundMode.on('activate').subscribe(() => { this.backgroundMode.disableWebViewOptimizations(); });  //this the key for background module to work

  }

    showAlertEmpty() {
        swal({
          title: 'Error!',
          text: 'Masukan NIK dan password Anda',
          type: 'error',
          confirmButtonText: 'Ok'
        })
    }

	submit() {
        let isConnected = true;
        if(!this.userid || !this.password) {
            this.showAlertEmpty();
        } else {
            if (this.isDevice) {
                let conntype = this.network.type;
                let isConnected = conntype && conntype !== 'unknown' && conntype !== 'none';
            } 

            if (isConnected == true) {

        		var link = this.host + '/user/login';
        		var myData = JSON.stringify({username: this.userid, password: this.password, uid: this.uid});

        		this.http.post(link, myData, {headers: { 'Content-Type': 'application/json', "Access-Control-Allow-Origin": "*" }})
    			.subscribe(result => {
                    let dataObj: any;
                    dataObj = result;
                    if(dataObj.status == true) { //user found
                        if (dataObj.cluster.length != 0) {
                            this.userdata.setUser(dataObj.user);
                            this.userdata.setCluster(dataObj.cluster);
                            this.userdata.setPatrol({ shift_id: dataObj.shift_id, unique_key: dataObj.unique_key });
                            this.userdata.setSetting(dataObj.settings);
                            // this.navCtrl.push(HomePage);
                            this.clustername = this.userdata.setCluster(dataObj.cluster);
                            this.navCtrl.push(PilihmenuPage, {clustername:dataObj.cluster[0].name});
                        } else {
                            swal({
                                title: 'Error !',
                                text: dataObj.message,
                                type: 'error',
                                confirmButtonText: 'Ok'
                            })
                        }
                        
                    } else {
                        swal({
                            title: 'Error !',
                            text: dataObj.message,
                            type: 'error',
                            confirmButtonText: 'Ok'
                        })
                    }
                    let namacluster = dataObj.cluster;
                    console.log(dataObj.cluster[0].name);
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
	}

    checkPermission() {
        this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION]);
    }	

    debug(message) {
        swal({
                  title: 'error!',
                  text: JSON.stringify(message),
                  type: 'error',
                  confirmButtonText: 'Ok'
                })
    }


  // bluetoothEnable() {

  // }

  // enabledBluetooth() {
  //   this.localNotifications.schedule({
  //     id: 1,
  //     text: 'turn on bluetooth!',
  //     sound: 'file://sound.mp3',
  //     data: { secret: 'sds' }
  //   });
  //   this.ble.enable();
  // }

  goUpdate(){
    this.navCtrl.push(CheckversionPage);
  }


  cekVersi(){
    // send data
    var link = this.host + '/version';
    console.log(link);
    this.http.get(link,{ headers:{'Content-Type':'application/json'}}).subscribe(result=>{
        let dataObject: any;
        dataObject = result;
        var hasil=JSON.stringify(dataObject);
        if(dataObject.app_version == this.versi){
          console.log('checkversion benar ' + dataObject.app_version +' saat ini : '+this.versi);
          // this.goHome();
          // this.goUpdate();
        }else{
          this.goUpdate();
          console.log('checkversion salah ' + dataObject.app_version+'saat ini : '+this.versi);
        //   swal({
        //     title: 'Maaf',
        //     text: 'Anda Harus Memperbarui Aplikasi Anda ',
        //     type: 'error',
        //     confirmButtonText: 'Ok'
        // })
        }
        console.log('Hasilnya ' + dataObject.app_version);
    },error=>{
        swal({
            title: 'Error!',
            text: JSON.stringify(error.message),
            type: 'error',
            confirmButtonText: 'Ok'
        })
        console.log('Error saat post data patroli : ' + error);
    });
    // console.log("Azwar Patroli : " + myData);
  }

    async checkFileLog() {
        this.file.listDir(this.file.externalDataDirectory,'').then( async (result) => {

            for(let file of result){
                if(file.isDirectory == true && file.name !='.' && file.name !='..'){
                // Code if its a folder
                }else if(file.isFile == true){
                    // Code if its a file
                    let name=file.name // File name
                    console.log('=== filename ' + name);
                    await this.uploadFileLog(name);
                    await this.removeFileLog(name);
                }
            }
        })

    }

    uploadFileLog(filename) {
        return new Promise((resolve, reject) => {
            const fileTransfer: FileTransferObject = this.transfer.create();
            let options: FileUploadOptions = {
                fileKey: 'log',
                fileName: filename,
                headers: {},
                params : {
                    'fileKey': 'log',
                    'fileName': filename}
            };

            fileTransfer.upload(this.file.externalDataDirectory + filename, this.host + '/upload_log', options)
            .then((data) => {
                resolve('success');
            }, (err) => {
                swal({
                    title: 'Info!',
                    text: 'Gagal Mengirim file log, periksa koneksi dan coba lagi',
                    type: 'info',
                    confirmButtonText: 'Ok'
                });
                reject('gagal kirim file log');
            })
        })
    }

    removeFileLog(filename) {
        return new Promise(resolve => {
            resolve(this.file.removeFile(this.file.externalDataDirectory, filename));
        })
    }
}
