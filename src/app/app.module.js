var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Geolocation } from '@ionic-native/geolocation';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpClientModule } from '@angular/common/http';
import { IBeacon } from '@ionic-native/ibeacon';
import { BLE } from '@ionic-native/ble';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { BackgroundMode } from '@ionic-native/background-mode';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { ClusterPage } from '../pages/cluster/cluster';
import { CheckpointPage } from '../pages/checkpoint/checkpoint';
import { ReportPage } from '../pages/report/report';
import { MqttProvider } from '../providers/mqtt/mqtt';
import { BeaconProvider } from '../providers/beacon/beacon';
import { UserDataProvider } from '../providers/user-data/user-data';
import { Network } from '@ionic-native/network';
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        NgModule({
            declarations: [
                MyApp,
                HomePage,
                LoginPage,
                ClusterPage,
                CheckpointPage,
                ReportPage
            ],
            imports: [
                BrowserModule,
                HttpClientModule,
                IonicModule.forRoot(MyApp),
            ],
            bootstrap: [IonicApp],
            entryComponents: [
                MyApp,
                HomePage,
                LoginPage,
                ClusterPage,
                CheckpointPage,
                ReportPage
            ],
            providers: [
                IBeacon,
                BLE,
                BackgroundMode,
                StatusBar,
                SplashScreen,
                Geolocation,
                AndroidPermissions,
                LocationAccuracy,
                { provide: ErrorHandler, useClass: IonicErrorHandler },
                MqttProvider,
                BeaconProvider,
                UserDataProvider,
                Network
            ]
        })
    ], AppModule);
    return AppModule;
}());
export { AppModule };
//# sourceMappingURL=app.module.js.map