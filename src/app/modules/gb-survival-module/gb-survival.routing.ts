import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import { GbSurvivalComponent } from './gb-survival.component';

// Route Configuration
const routes : Routes =[
    {
        path:'',
        component: GbSurvivalComponent
    }
]

export const routing: ModuleWithProviders = RouterModule.forChild(routes);