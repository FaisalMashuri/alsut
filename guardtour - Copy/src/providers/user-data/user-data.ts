import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class UserDataProvider {
    user = {
        name: '',
        id: '',
    }

    clusters : any;

    settings = {
        intervalCheckGPS : 1,
        intervalTracking : 1,
        intervalStorage : 30,
        radiusCheckpoint : 15,
        gpsAccuracy:10
    }

    patrol = {
        startPatrol: '',
        endPatrol: '', 
        shift_id:'',
        unique_key:''
    }

    clusterArray:string[] = new Array();
    trackArray:string[] = new Array();

    host = '';
    selectedCluster: string;
    selectedTrackName: string;
    selectedTrackId: string;
    currectCheckpoint: string;

    constructor(public http: HttpClient) {
        //  this.host = 'http://msgserver.southeastasia.cloudapp.azure.com:81/v1';
        //  this.host = 'http://43.251.98.16:82/v1';
         this.host = 'https://guardtour.alam-sutera.com:8082/v1';
         // this.host = 'http://local.apialamsutera.mbp:8080/v1';
    }

    setUser(data) {
        this.user.id = data.id;
        this.user.name = data.name;
    }

    setSetting(data) {
        this.settings.intervalCheckGPS = data.intervalCheckGPS;
        this.settings.intervalStorage = data.intervalStorage;
        this.settings.radiusCheckpoint = data.radiusCheckpoint;
        this.settings.intervalTracking = data.intervalTracking;
        this.settings.gpsAccuracy = data.gpsAccuracy;
    }

    getSetting() {
        return this.settings;
    }

    setCluster(data) {
        this.clusters = data;
    }

    //azwar get cluster
    setClusterAzwar(){
        
    }

    setPatrol(data) {
        if (typeof data.start !== 'undefined') this.patrol.startPatrol = data.start;
        if (typeof data.end !== 'undefined') this.patrol.endPatrol = data.end;
        if (typeof data.shift_id !== 'undefined') this.patrol.shift_id = data.shift_id;
        if (typeof data.unique_key !== 'undefined') this.patrol.unique_key = data.unique_key;
    }

    getHost() {
        return this.host;
    }

    getUser() {
        return this.user;
    }

    getPatrol() {
        return this.patrol;
    }

    getCluster() {
        return this.clusters;
    }

    getTrack() {
        let cluster = this.clusters;
        let tracks: string[] = new Array();
        cluster.forEach((data) => {
            tracks[data.id] = data.track;
            this.clusterArray[data.id] = data.name;
            this.trackArray[data.id] = data.track;
        }); 
        return tracks;
    }

    getCoordinates(clusterId) {
        let tracks = this.getTrack(); //all track
        var trackArr: any;
        var temp:any[] = new Array();
        let trackCheckpoint = tracks[clusterId][0]['checkpoint']; //get track baseon cluster select
        return trackCheckpoint;
    }

    getNameCluster(code) {
        return this.clusterArray[code];
    }

    setSelectedCluster(cluster) {
        this.selectedCluster = cluster
    }

    getSelectedCluster() {
        return this.getNameCluster(this.selectedCluster);
    }

    getSelectedClusterCode() {
        return this.selectedCluster;
    }

    setSelectedTrack(track) {
        this.selectedTrackName = track.name;
        this.selectedTrackId = track.id;
    }


    getSelectedTrack() {
      return this.selectedTrackId;
    }

    getSelectedTrackName() {
        return this.selectedTrackName;
    }
    getCheckpoint() {
        return this.currectCheckpoint;
    }

    setCheckpoint(value) {
        this.currectCheckpoint = value;
    }

  
}
