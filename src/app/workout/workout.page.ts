import { Component, OnInit } from '@angular/core';
import { Workouts, iWorkouts } from '../models/workout.model';
import { WorkoutService } from '../workout.service';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { Qoutes } from '../models/qoutes.model';
import { WorkoutDoneComponent } from '../workout-done/workout-done.component';
import { SignupService } from '../signup.service';
@Component({
  selector: 'app-workout',
  templateUrl: './workout.page.html',
  styleUrls: ['./workout.page.scss'],
})
export class WorkoutPage implements OnInit {
  streak: any = 0;
  highestStreak: any = 0;
  totalWorkoutDays: any = 0;
  lastWorkoutDate: any = 0;
  instructionList: iWorkouts[] = [];
  historyList: any[] = [];
  qoutesList: any = []
  qouteText: any;
  workoutName: string = "";
  isLoading: boolean = false;
  showExercise: boolean = false;
  showGuide: boolean;
  showInstruction: boolean = false;
  showMain: boolean = false;
  isModalOpen = false;
  backToWorkout = false;
  categoryName: string
  exerciseId: string = "";
  startIsClicked: boolean = false;
  doneIsClicked: boolean = false;
  repsSetsClicked: boolean = false;
  remainingSecondsStr: string;
  remainingSeconds: number;
  workoutDoneCountNum: number = 0;
  workoutDoneCountTxt: string = ``
  isInsideInstruction: boolean = false;
  nextWorkout: string = ""
  restartIsClicked: boolean = false;
  buttonTxt: string = "Done"
  intervalId: any;
  userId: any;
  neverGiveUpImg = "/assets/images/never-give-up.jpg"
  nextExerciseImg = "";
  currentExerciseIndex: number = 0; // Initialize the index of the current exercise
  totalCaloriesBurned: number;
  // For resting modal
  restingModalOpen = false;
  remainingRestTimeStr: string;
  restIntervalId: any;
  remainingRestTime: number;

  constructor(private workoutServ: WorkoutService, private modalCtrl: ModalController, private signupService: SignupService, private router: Router) { }

  workoutCategory: Workouts[] = [];
  workoutInsideCategory: Workouts[] = []
  workoutCategoryClicked: string;
  workoutCategoryClicked2: string;
  workoutCategoryLength: number;
  workoutDates: Date[] = [];
  streakList: Workouts[] = []
  userWeight: number;
  userHeight: number;
  userName: string;
  async ngOnInit() {
  }

  handleRefresh(event: any) {
    setTimeout(async () => {
      this.initApp()
      event.target.complete();
    }, 2000);
  }

  refreshWorkout(event: any) {
    setTimeout(async () => {
     this.goToSpecificWorkoutCategory();
      event.target.complete();
    }, 2000);
  }

  async initApp() {
    this.isLoading = true;
    this.userId = localStorage.getItem('userId')?.toString()
    // Check and update streak first
    // await this.workoutServ.checkAndUpdateStreak(this.userId);

    this.workoutCategory = await this.signupService.getWorkoutsCategory(this.userId);

    await this.getQoutes();

    await this.getStreak() // Display streak from firestore

    await this.getHistory()

    this.showMain = true;
    this.showGuide = true;
    this.showExercise = false;

    this.workoutServ.getUserInfo(this.userId).then((el: any) => {
      this.userWeight = el.weight
      this.userHeight = el.height
      this.userName = el.name
    });
    this.isLoading = false;
  }

  ionViewWillEnter() {
    this.initApp();
  }

  // Method to open the resting modal
  openRestingModal(seconds: number) {
    this.remainingRestTime = seconds; // Initialize remainingRestTime
    this.restingModalOpen = true;
    this.remainingRestTimeStr = `00:${this.remainingRestTime < 10 ? '0' : ''}${this.remainingRestTime}`;
    this.restIntervalId = setInterval(() => {
      this.remainingRestTime--;
      this.remainingRestTime = this.remainingRestTime; // Update remainingRestTime
      this.remainingRestTimeStr = `00:${this.remainingRestTime < 10 ? '0' : ''}${this.remainingRestTime}`;
      if (this.remainingRestTime <= 0) {
        clearInterval(this.restIntervalId);
        this.restingModalOpen = false;
      }
    }, 1000);
  }


  // Method to close the resting modal
  closeRestingModal() {
    clearInterval(this.restIntervalId);
    this.restingModalOpen = false;
  }

  addRestTime() {
    // Check if the resting modal is open
    if (this.restingModalOpen) {
      // Add 20 seconds to the remaining rest time
      this.remainingRestTime += 20;

      // Update the remaining rest time string to reflect the changes
      this.remainingRestTimeStr = `00:${this.remainingRestTime < 10 ? '0' : ''}${this.remainingRestTime}`;
    }
  }
  async getStreak() {
    this.isLoading = true
    this.streakList = await this.workoutServ.getStreak(this.userId)

    // Check if there is streak data fetched from Firestore
    if (this.streakList.length > 0) {
      const el = this.streakList[0]; // Assuming there's only one streak entry per user
      this.streak = el.streak;
      this.highestStreak = el.highestStreak;
      this.totalWorkoutDays = el.totalWorkoutDays;
      this.lastWorkoutDate = el.lastWorkoutDate;
    }
console.log(this.streakList);

    this.isLoading = false
  }




  resume() {
    this.backToWorkout = false;
  }

  // async restart() {
  //   // Reset flags and variables
  //   this.restartIsClicked = true
  // }

  quit() {
    this.backToWorkout = false
    this.isModalOpen = false
    this.startIsClicked = false;
    this.isInsideInstruction = false;
    // Clear the interval if it's running
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null; // Reset the intervalId to null
    }
  }

  // Fix
  async closeModal(isOpen: boolean) {
    // Backtoworkout variable w/ timer
    if (this.startIsClicked) {
      this.backToWorkout = true;
    } else {
      this.isModalOpen = isOpen;
      this.backToWorkout = false;
      this.showExercise = true;
      this.repsSetsClicked = false
      // this.getExerciseList();
    }
  }

  showWorkouts() {
    this.showGuide = true;
  }

  showWorkoutHistory() {
    this.showGuide = false;
    this.getHistory();
  }


  showInstructionInfoBool: boolean = false;
  showInstructionInfo() {
    if (this.showInstructionInfoBool == false) {
      this.showInstructionInfoBool = true
    } else {
      this.showInstructionInfoBool = false

    }
  }



  async back() {
    this.isLoading = true;
    this.showMain = true;
    this.showExercise = false;
    this.showInstruction = false;
    // this.workoutList = await this.workoutServ.getWorkouts();
    this.isLoading = false;
  }

  goToProfile() {
    this.router.navigate(['me'])
  }
  backToGuide() {
    this.showExercise = false
    this.showMain = true
  }

  workoutIndex:number;
  async goToExercises(index: number) {
    this.workoutIndex = index
    this.isLoading = true
    this.showMain = false;
    this.showExercise = true;

    // Passed the index of clicked button
    switch (index) {
      case 0:
        this.workoutCategoryClicked = 'abs'
        this.workoutCategoryClicked2 = "Abs Workout"
        break;
      case 1:
        this.workoutCategoryClicked = 'arms'
        this.workoutCategoryClicked2 = "Arms Workout"
        break;
      case 2:
        this.workoutCategoryClicked = 'chest'
        this.workoutCategoryClicked2 = "Chest Workout"
        break;
      case 3:
        this.workoutCategoryClicked = 'leg'
        this.workoutCategoryClicked2 = "Leg Workout"
        break;
      case 4:
        this.workoutCategoryClicked = 'shoulderBack'
        this.workoutCategoryClicked2 = "Shoulder & Back Workout"
        break;
      default:
        break;
    }
    this.goToSpecificWorkoutCategory()
    this.isLoading = false;
  }

  async goToSpecificWorkoutCategory() {
    this.isLoading = true
    this.workoutInsideCategory = await this.signupService.getSpecificWorkoutsByCategory(this.userId, this.workoutCategoryClicked)


    this.isLoading = false
  }


  async goToInstruction(workout: Workouts) {
    this.isLoading = true;
    this.isModalOpen = true
    this.instructionList = await this.workoutServ.getSpecificInstruction(this.userId, workout.type, workout.id);
    console.log(this.instructionList);
    this.instructionList.forEach(element => {
      console.log(element);
      this.workoutName = element.exerciseName
    });

    this.isLoading = false;
  };

  async updateWorkout(workout: Workouts) {
    this.isLoading = true;
    this.isModalOpen = false;
    this.repsSetsClicked = false;
    await this.workoutServ.updateWorkout(workout, this.userId, workout.type, workout.id);
    await this.goToSpecificWorkoutCategory()
    this.isLoading = false;
  }


  addReps(workout: Workouts) {
    workout.reps++;
    this.repsSetsClicked = true
  }

  minusReps(workout: Workouts) {
    if (workout.reps > 0) {
      workout.reps--;
      this.repsSetsClicked = true
    }
  }

  addSets(workout: Workouts) {
    workout.sets++;
    this.repsSetsClicked = true
  }

  minusSets(workout: Workouts) {
    if (workout.sets != 1) {
      workout.sets--;
      this.repsSetsClicked = true
    }
  }

  addSeconds(workout: Workouts) {
    this.repsSetsClicked = true;
    workout.startingTime++;
  }
  minusSeconds(workout: Workouts) {
    if (workout.startingTime != 30) {
      workout.startingTime--;
      this.repsSetsClicked = true;
    }

  }
  showBackExerciseBtn = false;
  currentSet: number = 1;
  secondsToWait: number;
  workoutCount: number = 0
  async startWorkout() {
    this.workoutCount = 0;
    this.workoutDuration = 0;
    this.isModalOpen = true;
    this.startIsClicked = true;
    this.isInsideInstruction = true;
    this.showBackExerciseBtn = true;
    let paused = false;

    const exerciseTimes: { duration: number, intensity: number }[] = [];

    for (let i = 0; i < this.workoutInsideCategory.length; i++) {
      const exercise = this.workoutInsideCategory[i];
      this.currentExerciseIndex = i;


      // Loop through the sets for the current exercise
      for (this.currentSet = 1; this.currentSet <= exercise.sets; this.currentSet++) {
        if (!paused) {
          this.doneIsClicked = false;

          // Clear previous exercise from instructionList
          this.instructionList = [];
          this.instructionList.push(exercise);
          this.workoutName = exercise.exerciseName;
          this.workoutCount ++;

          // Update UI with current exercise details
          this.showCurrentExercise(); // Call showCurrentExercise here

          // Record start time of the exercise
          const exerciseStartTime = Date.now();

          // Countdown timer
          this.secondsToWait = exercise.startingTime;
          await this.countdown(this.secondsToWait);

          // Record end time of the exercise
          const exerciseEndTime = Date.now();

          // Calculate actual exercise duration
          const actualExerciseDuration = (exerciseEndTime - exerciseStartTime) / 1000; // Duration in seconds

          // Store the actual exercise duration and intensity
          exerciseTimes.push({ duration: actualExerciseDuration, intensity: exercise.intensity });

          // Check if the user clicked the button to proceed to the next set
          if (this.doneIsClicked) {
            paused = true;
            this.doneIsClicked = false;
            break;
          }

          // Open resting modal after each exercise
          if (i < this.workoutInsideCategory.length - 1 || this.currentSet < exercise.sets) {
            // Shorter rest after each set within an exercise
            this.openRestingModal(30); // For example, 30 seconds rest
          } else if (i < this.workoutInsideCategory.length - 1 && this.currentSet === exercise.sets) {
            // Longer rest after the last set of an exercise
            this.openRestingModal(60); // For example, 60 seconds rest
          }

          await new Promise<void>((resolve) => {
            const restCheckInterval = setInterval(() => {
              if (!this.restingModalOpen) {
                clearInterval(restCheckInterval);
                resolve();
              }
            }, 1000);
          });
        } else {
          // If the workout is paused, wait for the button click to resume
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    this.finishWorkout(exerciseTimes);
  }

  workoutDuration: number = 0;
  isFinishedWorkout: boolean;
  async finishWorkout(exerciseTimes: { duration: number, intensity: number }[]) {
    this.startIsClicked = false;
    this.isModalOpen = false;
    this.doneIsClicked = false;
    this.isFinishedWorkout = true;
 

    const userWeight = this.userWeight; 
    this.totalCaloriesBurned = 0;

    
    exerciseTimes.forEach(({ duration, intensity }) => {
      this.totalCaloriesBurned += this.calculateCaloriesBurned(duration, intensity, userWeight);
      this.workoutDuration += duration;
    });

    await this.workoutServ.addToHistory(
      this.workoutInsideCategory,
      this.userId,
      this.totalCaloriesBurned,
      exerciseTimes
    );

   
   await this.getStreak()
  }

  goToHome() {
    this.isFinishedWorkout = false;
  }


  calculateCaloriesBurned(duration: number, intensity: number, weight: number): number {
    console.log("Intensity:", intensity); // Log the intensity
    console.log("Duration: ", duration);

    const met = this.getMetValue(intensity);
    const caloriesBurnedPerMinute = (met * weight * 3.5) / 200;
    return caloriesBurnedPerMinute * (duration / 60); // Convert duration to minutes
  }


  getMetValue(intensity: number): number {
    switch (intensity) {
      case 1: return 3.0; // Easy
      case 2: return 5.0; // Medium
      case 3: return 8.0; // Hard
      default: return 1.0;
    }
  }

  async countdown(seconds: number) {
    await new Promise<void>((resolve) => {
      let remainingSeconds = seconds; // Starting time (number)
      this.intervalId = setInterval(() => {
        if (this.doneIsClicked) {
          clearInterval(this.intervalId);
          this.intervalId = null;
          this.doneIsClicked = false;
          resolve();
          return;
        }

        // Calculate minutes and seconds
        const minutes = Math.floor(remainingSeconds / 60);
        const secondsToShow = remainingSeconds % 60;

        // Format seconds with leading zero if necessary
        const formattedSeconds = secondsToShow < 10 ? `0${secondsToShow}` : secondsToShow.toString();

        // Display countdown in MM:SS format
        this.remainingSecondsStr = `0${minutes}:${formattedSeconds}`;

        if (remainingSeconds <= 0) {
          clearInterval(this.intervalId);
          this.intervalId = null;
          resolve();
          return;
        }

        if (!this.isModalOpen && !this.backToWorkout) {
          clearInterval(this.intervalId);
          this.intervalId = null;
          resolve();
          return;
        }

        if (!this.backToWorkout) {
          remainingSeconds--;
        }

        if (this.restartIsClicked) {
          clearInterval(this.intervalId);
          this.intervalId = null;
          resolve();
        }
      }, 1000); // Update countdown every second
    });
  }



  async getHistory() {
    this.isLoading = true;
    this.historyList = await this.workoutServ.readHistory(this.userId); // Put the data from firestore to historyList array
    // console.log(this.historyList);
    this.isLoading = false;
  }

  async showDoneWorkouts(index: number) {
    this.isLoading = true;
    this.workoutServ.historyIndex = index
    const modal = await this.modalCtrl.create({
      component: WorkoutDoneComponent,
    });
    modal.present();
    this.isLoading = false
    // const { data, role } = await modal.onWillDismiss();

    // if (role === 'confirm') {
    // }
  }

  async getQoutes() {
    this.isLoading = true;
    this.qoutesList = await this.workoutServ.getQoutes();
    const randomIndex = Math.floor(Math.random() * this.qoutesList.length);
    this.qouteText = this.qoutesList[randomIndex].word;
    this.isLoading = false;
  }

  formatDate(timestamp: any): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString(); // Formats the date in a readable format (MM/DD/YYYY)
  }
  // formatDate(timestamp: any): string {
  //   const date = new Date(timestamp);
  //   const options = { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  //   return date.toLocaleString(options);
  // }
  
  

  done() {
    this.doneIsClicked = true;
  }

  /*
    backExercise() {
     // Clear the interval if it's running
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null; // Reset the intervalId to null
      }
      // Check if the index is out of bounds (less than 0)
      if (this.currentExerciseIndex > 0) {
        // Decrement the index of the current exercise to go back
        this.currentExerciseIndex--;
      } 
  
      // Show the updated exercise
      this.showCurrentExercise();
    }
  
    async skipExercise() {
      // Increment the index of the current exercise to skip to the next one
      this.currentExerciseIndex++;
      this.intervalId = null
      this.showBackExerciseBtn = true
  
      // Check if the index is out of bounds (greater than or equal to the total number of exercises)
      if (this.currentExerciseIndex >= this.workoutInsideCategory.length) {
        // If so, set it to the first exercise index
        this.currentExerciseIndex = 0;
      }
  
      // Show the updated exercise
      this.showCurrentExercise();
    }
  */
  // Helper method to display the current exercise
  showCurrentExercise() {
    // Get the current exercise based on the current index
    const currentExercise = this.workoutInsideCategory[this.currentExerciseIndex];

    // Set the next exercise image and name
    const nextExerciseIndex = (this.currentExerciseIndex + 1) % this.workoutInsideCategory.length;
    this.nextExerciseImg = this.workoutInsideCategory[nextExerciseIndex].exerciseImage; // Set next exercise image
    console.log(nextExerciseIndex);

    console.log(this.nextExerciseImg);

    // Update instruction list and UI with current exercise details
    this.instructionList = [currentExercise];
    this.workoutName = currentExercise.exerciseName;
    this.workoutDoneCountNum = this.currentExerciseIndex + 1;
    this.workoutDoneCountTxt = `${this.workoutDoneCountNum} / ${this.workoutInsideCategory.length}`;
    this.nextWorkout = this.workoutInsideCategory[nextExerciseIndex].exerciseName; // Set next workout name
  }

}
