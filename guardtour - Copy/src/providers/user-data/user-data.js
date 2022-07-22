var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
/*
  Generated class for the UserDataProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
var UserDataProvider = /** @class */ (function () {
    function UserDataProvider(http) {
        this.http = http;
        this.user = {
            name: '',
            id: '',
            cluster_code: '',
            cluster_name: '',
            track_code: '',
            track_name: '',
            next_beacon_id: '',
            next_beacon_description: ''
        };
        this.host = '';
        // this.host = 'http://139.59.226.254/v1';
        // this.host = 'http://209.97.168.161​/v1'
           this.host = 'http://43.251.98.16/v1';
    }
    UserDataProvider.prototype.setUser = function (data) {
        this.user.id = data.id;
        this.user.name = data.name;
        this.user.cluster_code = data.cluster_code;
        this.user.cluster_name = data.cluster_name;
        this.user.track_code = data.track_code;
        this.user.track_name = data.track_name;
        this.user.next_beacon_id = data.next_beacon_id;
        this.user.next_beacon_description = data.next_beacon_description;
    };
    UserDataProvider.prototype.getHost = function () {
        return this.host;
    };
    UserDataProvider.prototype.getUser = function () {
        return this.user;
    };
    UserDataProvider = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [HttpClient])
    ], UserDataProvider);
    return UserDataProvider;
}());
export { UserDataProvider };
//# sourceMappingURL=user-data.js.map