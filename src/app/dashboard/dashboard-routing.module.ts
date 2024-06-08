import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardPage } from './dashboard.page';
import { WorkoutPage } from '../workout/workout.page';
import { GoalPage } from '../goal/goal.page';
import { MePage } from '../me/me.page';
import { ExercisesPage } from '../exercises/exercises.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardPage,
    children: [
      {
        path: "workout",
        component: WorkoutPage
      },
      {
        path: "goal",
        component: GoalPage
      },
      {
        path: "me",
        component: MePage
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPageRoutingModule { }
