import { Injectable } from '@angular/core';
import { IBeacon } from '@ionic-native/ibeacon';
import { Platform, Events } from 'ionic-angular';

/*
  Generated class for the BeaconProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BeaconProvider {

    delegate: any;
    region: any;
    constructor(private ibeacon: IBeacon, public platform: Platform, public events: Events) {
        console.log('Hello BeaconProvider Provider');
    }

    initialise(): any {
        let promise = new Promise((resolve, reject) => {
        // we need to be running on a device
        if (this.platform.is('cordova')) {

            // Request permission to use location on iOS
            this.ibeacon.requestAlwaysAuthorization();

            // create a new delegate and register it with the native layer
            this.delegate = this.ibeacon.Delegate();

            // Subscribe to some of the delegate’s event handlers
            this.delegate.didRangeBeaconsInRegion()
            .subscribe(
                data => {
                this.events.publish('didRangeBeaconsInRegion', data);
                },
                error => console.error()
            );

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
        } else {
            console.error('This application needs to be running on a device');
            resolve(false);
        }
        });

            return promise;
    }


        // let beaconRegion = this.ibeacon.BeaconRegion('CBN_830','CB10023F-A318-3394-4199-A8730C7C1AEC');

        // this.ibeacon.startMonitoringForRegion(beaconRegion)
        //   .then(
        //     () => this.showMessage('Native layer recieved the request to monitoring'),
        //     error => this.showMessage('Native layer failed to begin monitoring: ')
        //   );


}
