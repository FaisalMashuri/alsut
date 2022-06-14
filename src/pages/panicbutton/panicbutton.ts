import { HttpClient } from '@angular/common/http';
import { HomePage } from './../home/home';
import { LoginPage } from './../login/login';
import { PilihmenuPage } from './../pilihmenu/pilihmenu';
import { ReportPage } from './../report/report';
import { UserDataProvider } from './../../providers/user-data/user-data';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import moment from 'moment';
import swal from 'sweetalert2';


declare var Paho: any;

/**
 * Generated class for the PanicbuttonPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-panicbutton',
  templateUrl: 'panicbutton.html',
})
export class PanicbuttonPage {
  username: any;
  cluster: any;
  client: any;

  clusterId: any;
  //lokasi
  watch: any;
  dataCoordinate: any;
  geo = {
    lat: 0,
    lng: 0,
    accuracy: 0
  };





  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private data: UserDataProvider,
    private geolocation: Geolocation,
    private http: HttpClient,
    public loadingCtrl: LoadingController) {
    let user = data.getUser();
    this.username = user.name;
    //  let datacluster = data.getNameCluster();
    //  this.cluster = navParams.get('clustername');
    this.cluster = navParams.get('clustername');

  }



  ionViewDidLoad() {
    this.cluster = this.navParams.get('clustername');

    console.log('ionViewDidLoad PanicbuttonPage');
    console.log('ionViewDidLoad ReportPage');

    //lokasi
    this.watch = this.geolocation.watchPosition({
      enableHighAccuracy: true,
      timeout: 1000,
      maximumAge: 1000
    });
    this.watch.subscribe((data) => {
      if (typeof data.coords !== 'undefined') {

        this.dataCoordinate = {
          lat: data.coords.latitude,
          lng: data.coords.longitude,
          acc: data.coords.accuracy,
        }

      }
      //stop
    });

  }



  MQTTsend(topic, mess) {
    let message = new Paho.MQTT.Message(mess);
    message.destinationName = topic;
    this.client.send(message);
    console.log("sending message " + mess);
}

  getDateTime(): string {
    return moment().format('YYYY-MM-DD H:mm:ss').toString();
  }

  report() {
    this.navCtrl.push(ReportPage);
  }

  kembali() {
    console.log('test');
    this.navCtrl.push(HomePage);
  }

  pilihmenu() {
    console.log('test');
    this.navCtrl.push(PilihmenuPage);
  }

  kebakaran() {
    // this.cluster;
    let link = this.data.getHost() + '/panic';


    //
    let myData = JSON.stringify({
      username: this.username,
      cluster:  68,
      longitude: this.dataCoordinate.lng,
      latitude: this.dataCoordinate.lat,
      type: '1',
      datetime: this.getDateTime(),
      filename: ''
    });

    this.http.post(link, myData, { headers: { 'Content-Type': 'application/json' } })
      .subscribe(result => {
        let dataObj: any;
        dataObj = result;
        if (dataObj.status == true) { //user found
          swal({
              title: 'Laporan Anda Berhasil Terkirim!',
              text: dataObj.message,
              type: 'success',
              confirmButtonText: 'Ok'
          })
          // this.openModalKebakaran();
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
    // loading
    // let loader = this.loadingCtrl.create({
    //   content: "Send report.. "
    // });
    // loader.present();
    // loader.setDuration(100);
    this.MQTTsend("v1/panic-button/alert", myData);

  }


  kebanjiran() {
    // this.cluster;
    let link = this.data.getHost() + '/panic';


    //
    let myData = JSON.stringify({
      username: this.username,
      cluster:  68,
      longitude: this.dataCoordinate.lng,
      latitude: this.dataCoordinate.lat,
      type: '2',
      datetime: this.getDateTime(),
      filename: ''
    });

    this.http.post(link, myData, { headers: { 'Content-Type': 'application/json' } })
      .subscribe(result => {
        let dataObj: any;
        dataObj = result;
        if (dataObj.status == true) { //user found
          swal({
              title: 'Laporan Anda Berhasil Terkirim!',
              text: dataObj.message,
              type: 'success',
              confirmButtonText: 'Ok'
          })
          // this.openModalKebakaran();
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
    // loading
    let loader = this.loadingCtrl.create({
      content: "Send report.. "
    });
    loader.present();
    loader.setDuration(100);
    this.MQTTsend("v1/panic-button/alert", myData);

  }

  kriminal() {
    // this.cluster;
    let link = this.data.getHost() + '/panic';


    //
    let myData = JSON.stringify({
      username: this.username,
      cluster:  68,
      longitude: this.dataCoordinate.lng,
      latitude: this.dataCoordinate.lat,
      type: '3',
      datetime: this.getDateTime(),
      filename: ''
    });

    this.http.post(link, myData, { headers: { 'Content-Type': 'application/json' } })
      .subscribe(result => {
        let dataObj: any;
        dataObj = result;
        if (dataObj.status == true) { //user found
          swal({
              title: 'Laporan Anda Berhasil Terkirim!',
              text: dataObj.message,
              type: 'success',
              confirmButtonText: 'Ok'
          })
          // this.openModalKebakaran();
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
    // loading
    let loader = this.loadingCtrl.create({
      content: "Send report.. "
    });
    loader.present();
    loader.setDuration(100);
    this.MQTTsend("v1/panic-button/alert", myData);

  }

  medis() {
    // this.cluster;
    let link = this.data.getHost() + '/panic';


    //
    let myData = JSON.stringify({
      username: this.username,
      cluster:  68,
      longitude: this.dataCoordinate.lng,
      latitude: this.dataCoordinate.lat,
      type: '4',
      datetime: this.getDateTime(),
      filename: ''
    });

    this.http.post(link, myData, { headers: { 'Content-Type': 'application/json' } })
      .subscribe(result => {
        let dataObj: any;
        dataObj = result;
        if (dataObj.status == true) { //user found
          swal({
              title: 'Laporan Anda Berhasil Terkirim!',
              text: dataObj.message,
              type: 'success',
              confirmButtonText: 'Ok'
          })
          // this.openModalKebakaran();
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
    // loading
    let loader = this.loadingCtrl.create({
      content: "Send report.. "
    });
    loader.present();
    loader.setDuration(100);
    this.MQTTsend("v1/panic-button/alert", myData);

  }
}
