import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewcheckpointPage } from './newcheckpoint';

@NgModule({
  declarations: [
    NewcheckpointPage,
  ],
  imports: [
    IonicPageModule.forChild(NewcheckpointPage),
  ],
})
export class NewcheckpointPageModule {}
