import { Component, OnInit } from '@angular/core';
import { Workouts, iWorkouts } from '../models/workout.model';
import { WorkoutService } from '../workout.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.page.html',
  styleUrls: ['./exercises.page.scss'],
})
export class ExercisesPage implements OnInit {
  id: any;
  workoutList: any = [];
  isLoading = false;
  constructor(private workoutServ: WorkoutService) { }

  async ngOnInit() {
    this.id = localStorage.getItem('exercise');
    this.isLoading = true;
    this.isLoading = false;
    console.log(this.workoutList);

  }

}
