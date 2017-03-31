import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TestComponent} from "./test.component";
import {routing} from './test.routes';
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  exports: [
    RouterModule
  ],
  declarations: [TestComponent]
})
export class TestModule { }
