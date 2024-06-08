import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { WorkoutService } from '../workout.service';

@Component({
  selector: 'app-workout-done',
  templateUrl: './workout-done.component.html',
  styleUrls: ['./workout-done.component.scss'],
})
export class WorkoutDoneComponent implements OnInit {
  isLoading = false;
  historyList: any[] = [];
  specificWorkout: any[] = []
  historyIndex: number;
  userId: any
  constructor(private modalCtrl: ModalController, private workoutServ: WorkoutService) { }


  async ngOnInit() {
    this.historyIndex = this.workoutServ.historyIndex;
    this.userId = localStorage.getItem('userId')?.toString()
    this.historyList = await this.workoutServ.readHistory(this.userId);
    this.getHistory()
    
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async getHistory() {
    this.isLoading = true;
    this.specificWorkout = this.historyList[this.historyIndex];
    this.specificWorkout = [this.specificWorkout];
    // console.log(this.specificWorkout.exerciseTimes[0].duration);
    this.isLoading = false;
  }
}
