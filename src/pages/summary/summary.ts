import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { ReportPage } from '../report/report';
import { UserDataProvider } from '../../providers/user-data/user-data';
import moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-summary',
  templateUrl: 'summary.html',
})
export class SummaryPage {
    userName: any;
    scheduleDate: any;
    startPatrol: any;
    endPatrol: any;
    status: any;
  constructor(private userDataProv: UserDataProvider, public navCtrl: NavController, public navParams: NavParams) {
      let objName = this.userDataProv.getUser();
      let objPatrol = this.userDataProv.getPatrol();
      this.userName = objName.name;
      this.scheduleDate = moment().format('YYYY-MM-DD');
      this.startPatrol = objPatrol.startPatrol;
      this.endPatrol = objPatrol.endPatrol;
      this.status = 'Complete';
  }

  ionViewDidLoad() {
  
  }

  logout() {
    this.navCtrl.push(LoginPage);
  }

  report() {
    this.navCtrl.push(ReportPage);
  }

}