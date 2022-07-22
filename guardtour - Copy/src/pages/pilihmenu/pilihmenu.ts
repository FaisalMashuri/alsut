import { LoginPage } from './../login/login';
import { HttpClient } from '@angular/common/http';
import { Network } from '@ionic-native/network';
import { UserDataProvider } from './../../providers/user-data/user-data';
import { HomePage } from './../home/home';
import { PanicbuttonPage } from './../panicbutton/panicbutton';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import swal from 'sweetalert2';
2
/**
 * Generated class for the PilihmenuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pilihmenu',
  templateUrl: 'pilihmenu.html',
})
export class PilihmenuPage {
  clustername : any;
  //logout
  isDevice: boolean;
  host: string;
  guardName: string;
  userdata:any;



  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private data: UserDataProvider,
    private network: Network,
    private http: HttpClient) {
    this.clustername=navParams.get('clustername');

    //getguardname
    this.userdata = this.data.getUser();
    this.guardName = this.userdata.name;

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PilihmenuPage');
    console.log('Datanya : '+this.clustername);
  }

   //panic button
   panic(){
    this.navCtrl.push(PanicbuttonPage,{clustername:this.clustername});
  }

  //guardtour
  guardtour(){
    this.navCtrl.push(HomePage);
  }

logout() {
  this.navCtrl.push(LoginPage);
}


  logoutAction() {
    let isConnected = true;

    if (this.isDevice) {
        let conntype = this.network.type;
        let isConnected = conntype && conntype !== 'unknown' && conntype !== 'none';
    } 

    if (isConnected == true) {

        var link = this.host + '/user/logout';
        var myData = JSON.stringify({username: this.guardName});

        this.http.post(link, myData, {headers: { 'Content-Type': 'application/json' }})
        .subscribe(result => {
            let dataObj: any;
            dataObj = result;

            if(dataObj.status == true) { //user found
                
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
}
