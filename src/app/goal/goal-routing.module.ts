import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GoalPage } from './goal.page';

const routes: Routes = [
  {
    path: '',
    component: GoalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GoalPageRoutingModule {}
