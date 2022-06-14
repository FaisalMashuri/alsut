import { LoginPage } from './../login/login';
import swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { UserDataProvider } from './../../providers/user-data/user-data';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
/**
 * Generated class for the CheckversionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-checkversion',
  templateUrl: 'checkversion.html',
})
export class CheckversionPage {
  host: string;
  versi:string='1.1.13';
  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     private sqlite: SQLite,        
     private userDataProv: UserDataProvider,
     private http: HttpClient,) {
      this.host = this.userDataProv.getHost();

  }

  ionViewDidLoad() {
    // this.test();
    this.cekVersi();
  }


   cekVersi(){
        // send data
        var link = this.host + '/version';
        this.http.get(link,{ headers:{'Content-Type':'application/json'}}).subscribe(result=>{
            let dataObject: any;
            dataObject = result;
            var hasil=JSON.stringify(dataObject);
            if(dataObject.app_version==this.versi){
              console.log('checkversion benar ' + dataObject.app_version);
              this.goHome();
            }else{
              console.log('checkversion salah ' + dataObject.app_version);
              swal({
                title: 'Maaf',
                text: 'Anda Harus Memperbarui Aplikasi Anda ',
                type: 'error',
                confirmButtonText: 'Ok'
            })
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


  updateApps(){
    window.open('https://play.google.com/apps/internaltest/4698490692663881258', '_system');
  }

  goHome(){
    this.navCtrl.push(LoginPage);
  }
}
