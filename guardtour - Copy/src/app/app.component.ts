import { CheckversionPage } from './../pages/checkversion/checkversion';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
// import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from '../pages/login/login';
// import { CheckpointPage } from '../pages/checkpoint/checkpoint';
// import { CheckpointPage } from '../pages/checkpoint/checkpoint';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  // rootPage:any = CheckpointPage;
  // rootPage:any = CheckpointPage;
  rootPage:any = LoginPage; //dirubah dulu
  // rootPage:any = CheckversionPage;


  constructor(platform: Platform, //statusBar: StatusBar,
    androidPermissions: AndroidPermissions,
     splashScreen: SplashScreen) {
    platform.ready().then(() => {
      androidPermissions.requestPermissions(
        [
          androidPermissions.PERMISSION.CAMERA,
          androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE, 
          androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
        ]
      );
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // statusBar.styleDefault();
      splashScreen.hide();
    });
  }
}

