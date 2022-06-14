import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { CheckpointPage } from '../checkpoint/checkpoint';
import { MapPage } from '../map/map';
import { UserDataProvider } from '../../providers/user-data/user-data';
import moment from 'moment';
import { Network } from '@ionic-native/network';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';
import swal from 'sweetalert2';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    userId: any;
	userName: any;
	clusterId: any;
    clusters: any;
    tracks: any;
	track: any;
    scheduleDate: any;
    isDevice: boolean;
    host: string;
    watch: any;
    dataCoordinate; any;

    constructor(
        private data: UserDataProvider, 
        private platform: Platform, 
        private http: HttpClient, 
        private userdata: UserDataProvider, 
        private network: Network, 
        private geolocation: Geolocation, 
        public navCtrl: NavController) {
            moment.locale('id'); //test moment

        let user = this.data.getUser();
        this.userId = user.id;
        this.scheduleDate = moment().format('DD MMM YYYY');
        this.userName = user.name;
        this.clusters = this.data.getCluster();
        this.tracks = [ { code:'', name:'Silahkan pilih cluster dulu'}];
        this.isDevice = this.platform.is('cordova');
        this.host = this.userdata.getHost();
        this.getLocation();

    }

    getLocation() {
        this.watch = this.geolocation.watchPosition({
            enableHighAccuracy: true,
            timeout: 1000,
            maximumAge: 1000
        });

        this.watch.subscribe((data) => {
            console.log(data)
            if (typeof data.coords !== 'undefined') {
                this.dataCoordinate = { 
                    lat: data.coords.latitude,
                    lng: data.coords.longitude,
                    acc: data.coords.accuracy,
                };
            } else {

            }
            
        });

    }

    logout() {
        this.logoutAction();
        this.navCtrl.pop();
    }

    start() {
        let selectedCluster = this.data.getSelectedClusterCode();
        if( typeof selectedCluster != 'undefined') {
            let track : any;
            track = this.data.getCoordinates(this.data.getSelectedClusterCode());
            let firstCoo = track[0]; //coordinate awal

            // if(this.isOnRange(firstCoo.latitude, firstCoo.longitude, this.dataCoordinate.lat, this.dataCoordinate.lng, 50)) {  zar debug
                // console.log(firstCoo);
                // console.log(this.dataCoordinate);
                
            if(this.isOnRange(firstCoo.latitude, firstCoo.longitude, this.dataCoordinate.lat, this.dataCoordinate.lng, 200)) {
                this.navCtrl.push(CheckpointPage);
                // console.log(firstCoo);
            } else {
                console.log(track)
                console.log("is on range : ", this.isOnRange(firstCoo.latitude, firstCoo.longitude, this.dataCoordinate.lat, this.dataCoordinate.lng, 200))
                
                swal({
                    title: 'Error !',
                    text: "Silahkan 'START' saat berada di POS pertama",
                    type: 'error',
                    confirmButtonText: 'Ok'
                })
            }
        } else {
                swal({
                    title: 'Error !',
                    text: 'Silahkan Pilih cluster terlebih dahulu',
                    type: 'error',
                    confirmButtonText: 'Ok'
                })
        }
    	
    }

    getTrack(cluster) {
        this.data.setSelectedCluster(cluster);
        let clusterTrack = this.data.getTrack();
        this.tracks = clusterTrack[cluster];
        this.track = this.tracks[0];
        this.data.setSelectedTrack(this.track);
    }

    trackChoose(track) {
        this.data.setSelectedTrack(track);
    }

    logoutAction() {
        let isConnected = true;

        if (this.isDevice) {
            let conntype = this.network.type;
            let isConnected = conntype && conntype !== 'unknown' && conntype !== 'none';
        } 

        if (isConnected == true) {

            var link = this.host + '/user/logout';
            var myData = JSON.stringify({username: this.userName});

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

    deg2rad(deg): number {
        return deg * (Math.PI/180)
    }

    isOnRange(lat1,lng1,lat2,lng2, radius): boolean {
        // return true;
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
        var dLon = this.deg2rad(lng2-lng1); 
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        d = d * 100 // on meter
        // return d;
        console.log(d)
        if (d < radius ) {
            return true;
        } else {
            return false;
        }
    }

}