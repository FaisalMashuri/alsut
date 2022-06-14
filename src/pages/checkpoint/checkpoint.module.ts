import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckpointPage } from './checkpoint';

@NgModule({
  declarations: [
    CheckpointPage,
  ],
  imports: [
    IonicPageModule.forChild(CheckpointPage),
  ],
})
export class CheckpointPageModule {}
