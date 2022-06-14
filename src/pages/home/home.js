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
import { NavController } from 'ionic-angular';
import { CheckpointPage } from '../checkpoint/checkpoint';
import { UserDataProvider } from '../../providers/user-data/user-data';
import moment from 'moment';
var HomePage = /** @class */ (function () {
    function HomePage(userdata, navCtrl) {
        this.userdata = userdata;
        this.navCtrl = navCtrl;
        var user = this.userdata.getUser();
        this.userId = user.id;
        var scheduleDate = moment().format('DD MM YYYY');
        this.scheduleDate = scheduleDate;
        this.userName = user.name;
        this.clusterName = user.cluster_name;
    }
    HomePage.prototype.logout = function () {
        this.navCtrl.pop();
    };
    HomePage.prototype.start = function () {
        this.navCtrl.push(CheckpointPage);
    };
    HomePage = __decorate([
        Component({
            selector: 'page-home',
            templateUrl: 'home.html'
        }),
        __metadata("design:paramtypes", [UserDataProvider, NavController])
    ], HomePage);
    return HomePage;
}());
export { HomePage };
//# sourceMappingURL=home.js.map