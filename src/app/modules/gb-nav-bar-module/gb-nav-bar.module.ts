import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbNavBarComponent} from './gb-nav-bar.component';
import {RouterModule} from '@angular/router';
import {TabMenuModule} from 'primeng/components/tabmenu/tabmenu';
import {FormsModule} from '@angular/forms';
import {MessagesModule} from 'primeng/primeng';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TabMenuModule,
    FormsModule,
    MessagesModule
  ],
  declarations: [GbNavBarComponent],
  exports: [GbNavBarComponent]
})
export class GbNavBarModule {
}
