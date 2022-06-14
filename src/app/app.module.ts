import { CheckversionPage } from './../pages/checkversion/checkversion';
import { PanicbuttonPage } from './../pages/panicbutton/panicbutton';
import { PilihmenuPage } from './../pages/pilihmenu/pilihmenu';
import { MapPage } from './../pages/map/map';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Geolocation } from '@ionic-native/geolocation';
// import { StatusBar } from '@ionic-native/status-bar';
import { HttpClientModule } from '@angular/common/http'; 
import { IBeacon } from '@ionic-native/ibeacon';
import { BLE } from '@ionic-native/ble';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { BackgroundMode } from '@ionic-native/background-mode';
import { MqttProvider } from '../providers/mqtt/mqtt';
import { BeaconProvider } from '../providers/beacon/beacon';
import { UserDataProvider } from '../providers/user-data/user-data';
import { Network } from '@ionic-native/network';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions } from '@ionic-native/media-capture';
import { Device } from '@ionic-native/device';
import {Camera} from '@ionic-native/camera';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { CheckpointPage } from '../pages/checkpoint/checkpoint';
import { ReportPage } from '../pages/report/report';
import { SummaryPage } from '../pages/summary/summary';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { AuthServiceProvider } from '../providers/auth-service/auth-service';
// import { FCM } from '@ionic-native/fcm/ngx';
//native audio
import { NativeAudio } from '@ionic-native/native-audio';
//azwarsqlite
// import { SQLite} from '@ionic-native/sqlite/ngx';
import { IonicStorageModule } from '@ionic/storage';
@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    CheckpointPage,
    ReportPage,
    PilihmenuPage,
    PanicbuttonPage,
    CheckversionPage,
    MapPage,
    SummaryPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: '__mydb',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    CheckpointPage,
    ReportPage,
    PilihmenuPage,
    PanicbuttonPage,
    CheckversionPage,
    SummaryPage,
    MapPage
  ],
  providers: [
    // FCM,
    // IBeacon,
    Camera,
    // BLE,
    BackgroundMode,
    // StatusBar,
    SplashScreen,
    Geolocation,
    AndroidPermissions,
    LocationAccuracy,
    // SQLite,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    NativeAudio, // Add NativeAudio to providers
    MqttProvider,
    // BeaconProvider,
    UserDataProvider,
    Network,
    LocalNotifications,
    MediaCapture, 
    Storage,
    Device,
    FileTransfer,
    
    FileTransferObject,
    File,
    AuthServiceProvider,
  ]
})
export class AppModule {}
