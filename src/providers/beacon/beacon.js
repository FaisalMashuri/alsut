var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { IBeacon } from '@ionic-native/ibeacon';
import { Platform, Events } from 'ionic-angular';
/*
  Generated class for the BeaconProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
var BeaconProvider = /** @class */ (function () {
    function BeaconProvider(ibeacon, platform, events) {
        this.ibeacon = ibeacon;
        this.platform = platform;
        this.events = events;
        console.log('Hello BeaconProvider Provider');
    }
    BeaconProvider.prototype.initialise = function () {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            // we need to be running on a device
            if (_this.platform.is('cordova')) {
                // Request permission to use location on iOS
                _this.ibeacon.requestAlwaysAuthorization();
                // create a new delegate and register it with the native layer
                _this.delegate = _this.ibeacon.Delegate();
                // Subscribe to some of the delegate’s event handlers
                _this.delegate.didRangeBeaconsInRegion()
                    .subscribe(function (data) {
                    _this.events.publish('didRangeBeaconsInRegion', data);
                }, function (error) { return console.error(); });
                // setup a beacon region – CHANGE THIS TO YOUR OWN UUID
                // this.region = this.ibeacon.BeaconRegion('deskBeacon','‘F7826DA6-4FA2-4E98-8024-BC5B71E0893E');
                // // start ranging
                // this.ibeacon.startRangingBeaconsInRegion(this.region)
                // .then(
                // () => {
                //     resolve(true);
                // },
                // error => {
                //     console.error('Failed to begin monitoring: ', error);
                //     resolve(false);
                //     }
                // );
            }
            else {
                console.error('This application needs to be running on a device');
                resolve(false);
            }
        });
        return promise;
    };
    BeaconProvider = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [IBeacon, Platform, Events])
    ], BeaconProvider);
    return BeaconProvider;
}());
export { BeaconProvider };
//# sourceMappingURL=beacon.js.map