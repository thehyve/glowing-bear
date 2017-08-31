import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavBarComponent} from './nav-bar.component';
import {RouterModule} from '@angular/router';
import {TabMenuModule} from 'primeng/components/tabmenu/tabmenu';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TabMenuModule
  ],
  declarations: [NavBarComponent],
  exports: [NavBarComponent]
})
export class NavBarModule {
}
