import { AuthServiceProvider } from './../../providers/auth-service/auth-service';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController} from 'ionic-angular';
// import { CheckpointPage } from '../checkpoint/checkpoint';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions, CaptureVideoOptions } from '@ionic-native/media-capture';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { UserDataProvider } from '../../providers/user-data/user-data';
import { Geolocation } from '@ionic-native/geolocation';
import swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

declare var Paho: any;


// const MEDIA_FILES_KEY = 'mediaFiles';

@IonicPage()
@Component({
  selector: 'page-report',
  templateUrl: 'report.html',
})




export class ReportPage {
    mediaFiles = [];
    imageURI: any;
    imageURIVideo: any;
    title: any;
    watch: any;
    description: any;
    dataCoordinate: any;
    client: any;
    mqttData: any;

    //azwarcamera
    public base64Image: string;
    public photos : any;
    azwarImageURI:any;
    public responseData: any;
    userData = { title: "", description: "", guard_id: "", cluster_id: "", shift_id: "", photo: "", status: 0, longitude: "",latitude: "" };

    
    constructor(private mediaCapture: MediaCapture, 
        public navCtrl: NavController, 
        public navParams: NavParams, 
        public loadingCtrl: LoadingController,
        private http: HttpClient, 
        private geolocation: Geolocation, 
        private userdata: UserDataProvider,
        private camera : Camera, 
        public authService: AuthServiceProvider,
        private transfer: FileTransfer) {
            //This line of code solved my problem 
    }

    

    ionViewDidLoad() {
      
        this.photos = [];
        console.log('ionViewDidLoad ReportPage');
        this.watch = this.geolocation.watchPosition({
            enableHighAccuracy: true,
            timeout: 1000,
            maximumAge: 1000
        });

        this.watch.subscribe((data) => {
            if (typeof data.coords !== 'undefined') {

                 this.dataCoordinate = { 
                    lat: data.coords.latitude,
                    lng: data.coords.longitude,
                    acc: data.coords.accuracy,
                }

            }

            //stop
            
        });
       

        this.mqttData = { 
            // host: '209.97.168.161',
            host: 'msgserver.southeastasia.cloudapp.azure.com:81',
            // username: 'psuyddse', 
            // password: '0LFWtA334Zyy',
            currentTopic: 'accident-report',
            ssl: false,
            port: 8083,
            clientId:'uid-' + Math.floor( Math.random() * 100 ) ,
            cleanSession: false,
        };

    }

     //azwar test camera
     azwarCameraTest() {
        console.log("coming here");
    
        const options: CameraOptions = {
          quality: 50,
          destinationType: this.camera.DestinationType.DATA_URL,
          encodingType: this.camera.EncodingType.JPEG,
          mediaType: this.camera.MediaType.PICTURE,
          targetWidth: 450,
          targetHeight: 450,
          saveToPhotoAlbum: false
        };
        this.camera.getPicture(options);
    
        // this.camera.getPicture(options).then(
        //   imageData => {
        //     this.base64Image = "data:image/jpeg;base64," + imageData;
        //     this.photos.push(this.base64Image);
        //     this.photos.reverse();
        //     this.sendData(imageData);
        //   },
        //   err => {
        //     console.log(err);
        //   }
        // );
      }


      sendData(imageData) {
        let userdata = this.userdata.getUser();

        this.userData.title = this.title;
        this.userData.description = this.description;
        this.userData.guard_id = userdata.id;
        this.userData.cluster_id = this.userdata.getSelectedClusterCode();
        this.userData.shift_id = '0';
        this.userData.photo = imageData;
        this.userData.latitude = this.dataCoordinate.lat;
        this.userData.longitude = this.dataCoordinate.lat;
        this.userData.status = 0;
        console.log(this.userData);
        this.authService.postData(this.userData, "report/post").then(
          result => {
            this.responseData = result;
          },
          err => {
            // Error log
            console.log(err);
          }
        );
      }



    submit() {
      //save
      
      let userdata = this.userdata.getUser();
      let link = this.userdata.getHost() + '/report/post';
      // let imagename = '';
      // let videoname = '';

      // if (this.imageURI.name === undefined)  {

      // } else {
      //     imagename = this.imageURI.name;
      // }

      
      // if (this.imageURIVideo.name === undefined)  {

      // } else {
      //     videoname = this.imageURIVideo.name;
      // }
      
      let myData = JSON.stringify({
          guard_id: userdata.id, 
          cluster_id: this.userdata.getSelectedClusterCode(), 
          shift_id: '0', 
          title: this.title, 
          description: this.description,
          photo: this.imageURI.name, //ori
          // photo: this.base64Image,
          video: '',
          longitude: this.dataCoordinate.lng,
          latitude: this.dataCoordinate.lat,
          status: 0
      });
      

     // if (imagename != '') {
          let loader = this.loadingCtrl.create({
            content: "Uploading... Image"
          });
          loader.present();

          const fileTransfer: FileTransferObject = this.transfer.create();

          let options: FileUploadOptions = {
            fileKey: 'photo',
            fileName: this.imageURI.name, //aslinya
            chunkedMode: false,
            mimeType: this.imageURI.type, //ori
            headers: {}
          }
          console.log('azwar debug full path: '+this.imageURI.fullPath);
          console.log('azwar debug image uri name: '+this.imageURI.name);
          // console.log(options);
          fileTransfer.upload(this.imageURI.fullPath, this.userdata.getHost() + '/report/postfile', options)
            .then((data) => {
            console.log(data+" Uploaded Successfully");
            // this.imageFileName = "http://192.168.0.7:8080/static/images/ionicfile.jpg"

            loader.dismiss();
            this.http.post(link, myData, {headers: { 'Content-Type': 'application/json' }})
                .subscribe(result => {
                    let dataObj: any;
                    dataObj = result;
                    if(dataObj.status == 'Ok') { //user found
                        swal({
                            title: 'Success!',
                            text: 'Uploaded Successfully',
                            type: 'info',
                            confirmButtonText: 'Ok'
                        })
                        var mess = [];
                        mess['cluster_id'] = this.userdata.getSelectedClusterCode() ;
                        let message = new Paho.MQTT.Message(JSON.stringify(mess));
                        message.destinationName = this.mqttData.currentTopic;

                        /**
                         * kondisi untuk mengirim data apabila koneksi terputus
                         *  
                         **/
                        if(this.client.isConnected()){
                            this.client.send(message);
                            console.log("MQTT sent data at ");  
                            console.log(mess);
                        } else {
                            console.log("MQTT sent data fail at"); 
                            this.MQTTconnect(); 
                        }
                        
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
            // this.debug("Image uploaded successfully");
          }, (err) => {
            console.log(err);
            loader.dismiss();
            this.debug(err);
          });
      // }

      // if (videoname != '') {
          // let loader = this.loadingCtrl.create({
          //   content: "Uploading... Video"
          // });
          // loader.present();

          // const fileTransfer: FileTransferObject = this.transfer.create();

          // let options: FileUploadOptions = {
          //   fileKey: 'video',
          //   fileName: this.imageURIVideo.name,
          //   chunkedMode: false,
          //   mimeType: this.imageURIVideo.type,
          //   headers: {}
          // }

          // // console.log(options);
          // fileTransfer.upload(this.imageURIVideo.fullPath, this.userdata.getHost() + '/report/postfile', options)
          //   .then((data) => {
          //   console.log(data+" Uploaded Successfully");
          //   // this.imageFileName = "http://192.168.0.7:8080/static/images/ionicfile.jpg"
          //   loader.dismiss();
          //   // this.debug("Image uploaded successfully");
          // }, (err) => {
          //   console.log(err);
          //   loader.dismiss();
          //   this.debug(err);
          // });
      // }

      

      
    }

    takePicture() {
        // this.azwarCameraTest();
        // this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
        //     result => console.log('Has permission?',result.hasPermission),
        //     err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
        //   );
          
        //   this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA, this.androidPermissions.PERMISSION.GET_ACCOUNTS]);




        let options: CaptureImageOptions = { limit: 1, };
        this.mediaCapture.captureImage(options)
          .then(
            (data: MediaFile[]) => {
                let dataObj: any;
                this.imageURI = data[0];
                // this.debug(dataObj);
                // dataObj.fullPath.jpg
            },
            (err: CaptureError) => this.debug(err)
          );
    }

    takeVideo() {
        let options: CaptureVideoOptions = { limit: 1, duration: 20};
        this.mediaCapture.captureVideo(options)
          .then(
            (data: MediaFile[]) => {
                let dataObj: any;
                this.imageURIVideo = data[0];
                // this.imageURI = dataObj.fullPath;

                // this.debug(dataObj);
                //dataObj.fullPath .mp4

            },
            (err: CaptureError) => this.debug(err)
          );
    }

    cancel() {
      this.navCtrl.pop();
    }


    debug(message) {
        swal({
                      title: 'Error!',
                      text: JSON.stringify(message),
                      type: 'error',
                      confirmButtonText: 'Ok'
                    })
    }

    /*storeMediaFiles(files) {
        this.storage.get(MEDIA_FILES_KEY).then(res => {
          if (res) {
            let arr = JSON.parse(res);
            arr = arr.concat(files);
            this.storage.set(MEDIA_FILES_KEY, JSON.stringify(arr));
          } else {
            this.storage.set(MEDIA_FILES_KEY, JSON.stringify(files))
          }
          this.mediaFiles = this.mediaFiles.concat(files);
        })
    }*/

    MQTTconnect() {
        let reconnectTimeout = 2000;
        console.log("START");
        this.client = new Paho.MQTT.Client(
                this.mqttData.host,
                Number(this.mqttData.port),
                this.mqttData.clientId  //Client Id
            );
        //callabacks
        this.client.onConnectionLost = this.onConnectionLost;  
        this.client.onMessageArrived = this.onMessageArrived;
        var options = {
            timeout: reconnectTimeout,
            useSSL:this.mqttData.ssl,
            onSuccess:this.onConnect(this),
            onFailure:this.doFail
        };
        console.log("TXSS", options);
        this.client.connect(options);
    };

    onConnect(callback) {
        return function(){
            console.log("MQTT CONNECT");
        }
    }

    doFail(e){
    }

    onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
    }

    onMessageArrived(message) {
        console.log(message.payloadString);
    }

   
}


//captureAudio
