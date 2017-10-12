import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbNavBarComponent} from './gb-nav-bar.component';
import {RouterModule} from '@angular/router';
import {TabMenuModule} from 'primeng/components/tabmenu/tabmenu';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TabMenuModule
  ],
  declarations: [GbNavBarComponent],
  exports: [GbNavBarComponent]
})
export class GbNavBarModule {
}
