import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DataSelectionComponent} from "./data-selection.component";

import {QueryComponent} from "./components/query/query.component";
import {DataViewComponent} from "./components/data-view/data-view.component";


const routes: Routes = [
  {
    path: '',
    component: DataSelectionComponent,
    children:[
      {
        path: 'query',
        component: QueryComponent
      },
      {
        path: 'data-view',
        component: DataViewComponent
      }
    ]
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
