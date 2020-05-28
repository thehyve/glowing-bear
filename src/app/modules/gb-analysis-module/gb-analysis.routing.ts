import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
//import { GbSurvivalComponent } from './panel-components/gb-survival-res/gb-survival.component';
import { GbAnalysisComponent} from './gb-analysis.component'


// Route Configuration
const routes : Routes =[
    {
        path:'',
        component: GbAnalysisComponent
    }
]

export const routing: ModuleWithProviders = RouterModule.forChild(routes);