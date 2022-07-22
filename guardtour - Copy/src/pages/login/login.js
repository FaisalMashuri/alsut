var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';
// import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
import { HomePage } from '../home/home';
import { UserDataProvider } from '../../providers/user-data/user-data';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Network } from '@ionic-native/network';
var LoginPage = /** @class */ (function () {
    function LoginPage(network, androidPermissions, locationAccuracy, backgroundMode, userdata, platform, http, navCtrl, navParams) {
        var _this = this;
        this.network = network;
        this.androidPermissions = androidPermissions;
        this.locationAccuracy = locationAccuracy;
        this.backgroundMode = backgroundMode;
        this.userdata = userdata;
        this.platform = platform;
        this.http = http;
        this.navCtrl = navCtrl;
        this.navParams = navParams;
        this.host = this.userdata.getHost();
        //handle back button
        platform.ready().then(function () {
            _this.locationAccuracy.canRequest().then(function (canRequest) {
                if (canRequest) {
                    // the accuracy option will be ignored by iOS
                    _this.locationAccuracy.request(_this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(function () { return function () {
                        console.log('Request successful');
                    }; }, function (error) { return console.log('Error requesting location permissions', error); });
                }
            });
            //back button handle
            //Registration of push in Android and Windows Phone
            platform.registerBackButtonAction(function () {
                var view = _this.navCtrl.getActive();
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
                        }).then(function (result) {
                            if (result.value === true) {
                                _this.platform.exitApp();
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
                        }).then(function (result) {
                            if (result.value === true) {
                                _this.navCtrl.push(LoginPage_1);
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
                        }).then(function (result) {
                            if (result.value === true) {
                                _this.navCtrl.push(LoginPage_1);
                            }
                        });
                        break;
                }
            });
        });
    }
    LoginPage_1 = LoginPage;
    LoginPage.prototype.ionViewDidLoad = function () {
    };
    LoginPage.prototype.ionViewDidEnter = function () {
        var _this = this;
        this.backgroundMode.setDefaults({
            title: 'Alam Sutera',
            text: 'Guard Tour Application',
            icon: 'icon',
            color: 'F14F4D',
            resume: true,
            hidden: false,
            bigText: false
        });
        if (!this.backgroundMode.isActive()) {
            this.backgroundMode.enable();
        }
        ;
        this.backgroundMode.on('activate').subscribe(function () { _this.backgroundMode.disableWebViewOptimizations(); }); //this the key for background module to work
    };
    LoginPage.prototype.showAlertEmpty = function () {
        swal({
            title: 'Error!',
            text: 'Enter Username and Password First!',
            type: 'error',
            confirmButtonText: 'Ok'
        });
    };
    LoginPage.prototype.submit = function () {
        var _this = this;
        if (!this.userid || !this.password) {
            this.showAlertEmpty();
        }
        else {
            var conntype = this.network.type;
            var isConnected = conntype && conntype !== 'unknown' && conntype !== 'none';
            if (isConnected == true) {
                var link = this.host + '/user/login';
                var myData = JSON.stringify({ username: this.userid, password: this.password });
                this.http.post(link, myData, { headers: { 'Content-Type': 'application/json' } })
                    .subscribe(function (result) {
                    var data;
                    data = result;
                    if (data.status == true) {
                        _this.http.get(_this.host + '/user/get?username=' + data.username)
                            .subscribe(function (result) {
                            var data;
                            data = result;
                            if (data.result == true) {
                                var userObj = {
                                    id: 1,
                                    name: data.username,
                                    cluster_code: data.cluster_code,
                                    track_code: data.track_code,
                                    cluster_name: data.cluster_name,
                                    track_name: data.track_name,
                                    next_beacon_id: data.beacon.id,
                                    next_beacon_description: data.beacon.description
                                };
                                _this.userdata.setUser(userObj);
                                _this.navCtrl.push(HomePage);
                            }
                            else {
                                swal({
                                    title: 'Error!',
                                    text: data.message,
                                    type: 'error',
                                    confirmButtonText: 'Ok'
                                });
                            }
                        }, function (error) {
                            swal({
                                title: 'Error!',
                                text: JSON.stringify(error.message),
                                type: 'error',
                                confirmButtonText: 'Ok'
                            });
                        });
                    }
                    else {
                        swal({
                            title: 'Error!',
                            text: data.message,
                            type: 'error',
                            confirmButtonText: 'Ok'
                        });
                    }
                }, function (error) {
                    swal({
                        title: 'Error!',
                        text: JSON.stringify(error.message),
                        type: 'error',
                        confirmButtonText: 'Ok'
                    });
                });
            }
            else {
                swal({
                    title: 'Error!',
                    text: 'No Connection',
                    type: 'error',
                    confirmButtonText: 'Ok'
                });
            }
        }
    };
    LoginPage.prototype.checkPermission = function () {
        // this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
        //   result => console.log('Has permission?',result.hasPermission),
        //   err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
        // );
        this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION]);
        // this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
        //   result => console.log('Has permission?',result.hasPermission),
        //   err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
        // );
        // this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE]);
    };
    LoginPage = LoginPage_1 = __decorate([
        Injectable(),
        IonicPage(),
        Component({
            selector: 'page-login',
            templateUrl: 'login.html',
        }),
        __metadata("design:paramtypes", [Network, AndroidPermissions, LocationAccuracy, BackgroundMode, UserDataProvider, Platform, HttpClient, NavController, NavParams])
    ], LoginPage);
    return LoginPage;
    var LoginPage_1;
}());
export { LoginPage };
//# sourceMappingURL=login.js.map