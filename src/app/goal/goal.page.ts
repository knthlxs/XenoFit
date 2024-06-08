import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutService } from '../workout.service';
import { Workouts } from '../models/workout.model';
import { Observable } from 'rxjs';
import { WorkoutPlan, WorkoutPlanService } from '../workout-plan.service';
import { SignupService } from '../signup.service';
import { LoadingController } from '@ionic/angular';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

@Component({
  selector: 'app-goal',
  templateUrl: './goal.page.html',
  styleUrls: ['./goal.page.scss'],
})
export class GoalPage implements OnInit {
  selectedGoal: string;
  currentDateTime: string;
  workoutDates: Workouts[] = [];
  userId: any;
  formattedWorkoutDates: string[] = [];
  workoutPlans: any;
  selectedGoals: string[] = []; // Variable to hold selected goals
  highlightedDates: { date: string; textColor: string; backgroundColor: string }[] = [];

  timesPerWeekShow = false;
  userWeight: number;
  userHeight: number;
  userName: string;
  weightCurrentIn: number
  weightTargetIn: number
  daysToReachStr: string
  gainLossPerDay: number
  weightGoalStr: string
  workoutPlansLength: number
  selectedValue: number = 1;
  hideRange: boolean = false
  hideSettingGoal = false;
  targetWeightTxt: string
  weight: number;
  height: number;
  age: number;
  gender: string;
  activityLevel: ActivityLevel;

  results: any;


  healthCalculatorList: any = []
  healthCalculatorListLength: number;
  showHealthCalculator: boolean = true;
  calories: number
  protein: number
  fat: number
  carbohydrates: number

  constructor(private router: Router, private workoutServ: WorkoutService, private workoutPlanService: WorkoutPlanService, private signUpServ: SignupService, private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.initApp();

  }
  handleRefresh(event: any) {
    setTimeout(async () => {
      this.initApp()
      event.target.complete();
    }, 2000);
  }
  async initApp() {
    this.userId = localStorage.getItem('userId')?.toString() || '';
    this.setDateAndTime();
    await this.getWorkoutDates();
    await this.getWorkoutPlan();
    await this.fetchTargetWeight();
    await this.fetchHealthCalculator();

    this.workoutServ.getUserInfo(this.userId).then((el: any) => {
      this.userWeight = el.weight
      this.userHeight = el.height
      this.userName = el.name
      this.age = el.age
      this.gender = el.gender
      this.weightCurrentIn = this.userWeight;
    });
  }
  ionViewWillEnter(){
   this.initApp();
  }
  weekGoalStr: string;
  async calculate() {
    try {
      // Check if all required fields are provided
      if (this.userWeight && this.userHeight && this.age && this.gender && this.activityLevel) {
        this.load();
  
        // Log input values for debugging
        console.log('Calculating with values:', {
          weight: this.userWeight,
          height: this.userHeight,
          age: this.age,
          gender: this.gender,
          activityLevel: this.activityLevel
        });
  
        // Calculate BMR
        const bmr = this.calculateBMR(this.userWeight, this.userHeight, this.age, this.gender);
        console.log('BMR:', bmr);
  
        // Calculate TDEE
        const tdee = this.calculateTDEE(bmr, this.activityLevel);
        console.log('TDEE:', tdee);
  
        // Calculate Macros
        this.results = this.calculateMacros(tdee);
        console.log('Macro Results:', {
          calories: this.calories,
          protein: this.protein,
          fat: this.fat,
          carbohydrates: this.carbohydrates
        });
  
        // Save health calculator results
        this.healthCalculatorList = await this.workoutPlanService.setHealthCalculator(
          this.userId, this.calories, this.protein, this.fat, this.carbohydrates
        );
        this.fetchHealthCalculator();
      } else {
        // Handle missing fields
        this.signUpServ.presentToast('Please fill all required fields.');
        console.error('Missing required fields:', {
          weight: this.userWeight,
          height: this.userHeight,
          age: this.age,
          gender: this.gender,
          activityLevel: this.activityLevel
        });
      }
    } catch (error) {
      console.error('Error during calculation:', error);
    }
  }
  

  async recalculate() {
    this.load()
    await this.workoutPlanService.deleteHealthCalculator(this.userId);
    this.fetchHealthCalculator();
  }

  calculateBMR(weight: number, height: number, age: number, gender: string): number {
 
    if (gender.toLowerCase() === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    const activityFactors: { [key in ActivityLevel]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };
    return bmr * activityFactors[activityLevel];
  }

  calculateMacros(tdee: number) {
    const proteinRatio = 0.3;  // 30% of calories from protein
    const fatRatio = 0.25;     // 25% of calories from fat
    const carbRatio = 0.45;    // 45% of calories from carbohydrates

    const proteinCalories = tdee * proteinRatio;
    const fatCalories = tdee * fatRatio;
    const carbCalories = tdee * carbRatio;

    this.protein = proteinCalories / 4; // 1 gram of protein = 4 calories
    this.fat = fatCalories / 9;         // 1 gram of fat = 9 calories
    this.carbohydrates = carbCalories / 4;       // 1 gram of carbohydrate = 4 calories
    this.calories = tdee;
    // return {
    //   calories: this.calories.toFixed(2),
    //   protein: this.protein.toFixed(2),
    //   fat: this.fat.toFixed(2),
    //   carbohydrates: this.carbohydrates.toFixed(2),
    // };
  }

    async fetchHealthCalculator() {
      try {
        this.healthCalculatorList = await this.workoutPlanService.fetchHealthCalculator(this.userId);
        this.healthCalculatorListLength = this.healthCalculatorList.length;
        console.log('Health Calculator List:', this.healthCalculatorList);
        console.log('Health Calculator List Length:', this.healthCalculatorListLength);
      } catch (error) {
        console.error('Error fetching health calculator:', error);
      }
    }
    




  // printWeightGoal() {
  //   this.weightGoalStr = `Your estimated days of completing your target weight is ${this.calculateDaysToReachTargetWeight()}`
  // }
  showTargetWeight: boolean = false;
  daysToTargetWeight: number;
  startingDateStr: string;
  endDateStr: string;
  async calculateDaysToReachTargetWeight() {
    if (this.weightCurrentIn && this.weightTargetIn && this.gainLossPerDay) {
      this.load();

      const currentDate = new Date();
      this.daysToTargetWeight = Math.ceil(Math.abs((this.weightTargetIn - this.weightCurrentIn) / this.gainLossPerDay));
      const endDate = new Date(currentDate);
      endDate.setDate(currentDate.getDate() + this.daysToTargetWeight);

      this.startingDateStr = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
      this.endDateStr = `${endDate.getMonth() + 1}/${endDate.getDate()}/${endDate.getFullYear()}`;

      // this.targetWeightTxt = `Your estimated days of completing your target weight from ${this.weightCurrentIn} kg to ${this.weightTargetIn} kg is ${this.daysToTargetWeight} days
      // from ${this.startingDateStr}
      // to ${this.endDateStr}`;

      await this.workoutPlanService.setTargetWeight(this.userId,this.weightCurrentIn, this.weightTargetIn, this.daysToTargetWeight, this.startingDateStr, this.endDateStr);
      this.showTargetWeight = true;
      this.fetchTargetWeight();
    } else {
      this.showTargetWeight = false;
      this.signUpServ.presentToast('Please input all required fields.');
    }
  }



  targetWeight: any = []
  targetWeightLength = 0;
  async fetchTargetWeight() {
    this.targetWeight = await this.workoutPlanService.fetchTargetWeight(this.userId);
    console.log(this.targetWeight);

    this.targetWeightLength = this.targetWeight.length;
  }

  async calculateTargetWeightAgain() {
    this.load();
    await this.workoutPlanService.deleteTargetWeight(this.userId);
    this.fetchTargetWeight();
  }

  goalSelected(event: any) {
    // this.hideSettingGoal = true;
    this.selectedGoal = event.detail.value;
    console.log(this.selectedGoal);
    switch (this.selectedGoal) {
      case 'frequency': {
        this.timesPerWeekShow = true;
        break;
      }
      case 'duration': {
        this.timesPerWeekShow = false;
        break;
      }
      case 'calories': {
        this.timesPerWeekShow = false;
        break;
      }
    }
  }

  goToProfile() {
    this.router.navigate(['me']);
  }

  async load() {
    const loading = await this.loadingCtrl.create({
      message: 'Loading...',
      duration: 1000,
    });

    loading.present();
  }

  numberOfGoal = 0;
  async setGoal() {
    this.load()


    const currentDate = new Date();
    // const daysToTargetWeight = Math.ceil(Math.abs((this.weightTargetIn - this.weightCurrentIn) / this.gainLossPerDay));
    const endDate = new Date(currentDate);
    endDate.setDate(currentDate.getDate() + 7);

    const startingDateStr = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
    const endDateStr = `${endDate.getMonth() + 1}/${endDate.getDate()}/${endDate.getFullYear()}`;

    this.weekGoalStr = `from ${startingDateStr} to ${endDateStr}`

    this.numberOfGoal++;
    await this.workoutPlanService.setWorkoutFrequency(this.userId, this.selectedValue, this.burnCaloriesValue)
    this.getWorkoutPlan();
    this.hideSettingGoal = true;

  }
  //  goal:any = []
  // async  getGoal () {
  //   this.hideRange = true
  //   this.goal = await  this.workoutPlanService.fetchWorkoutPlans(this.userId)
  //   }

  async getWorkoutDates() {
    this.workoutDates = await this.workoutServ.readWorkoutDate(this.userId);
    const formattedWorkoutDates: string[] = [];
    this.workoutDates.forEach(dateArray => {
      dateArray.workoutDates.forEach((dateString: string) => {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          formattedWorkoutDates.push(date.toISOString());
        }
      });
    });
    this.formattedWorkoutDates = formattedWorkoutDates;

    // Populate highlightedDates
    this.highlightedDates = this.formattedWorkoutDates.map((date: string) => ({
      date: date.slice(0, 10),
      textColor: '#800080',
      backgroundColor: '#ffc0cb',
    }));
    console.log(this.highlightedDates);
    console.log(this.formattedWorkoutDates);
  }

  setDateAndTime() {
    // Get the current date and time
    const now = new Date();
    // Format the date and time to ISO string (YYYY-MM-DDTHH:mm:ss)
    this.currentDateTime = now.toISOString();
  }

  // Days to achieve for goal
  timesPerWeek(event: any) {
    this.selectedValue = event.detail.value;
    console.log('Selected value:', this.selectedValue);
  }

  burnCaloriesValue: number = 100
  burnCalories(event: any) {
    this.burnCaloriesValue = event.detail.value;
    console.log('Selected value:', this.burnCaloriesValue);
  }

  async getWorkoutPlan() {
    this.workoutPlans = await this.workoutPlanService.fetchWorkoutPlans(this.userId);
    console.log(this.workoutPlans);
    this.workoutPlansLength = this.workoutPlans.length;
  }

  addWorkoutPlan() {
    this.workoutPlanService.addWorkoutPlan(this.userId);
  }

  // updateWorkoutPlan(plan: WorkoutPlan) {
  //   plan.name = 'Updated Plan Name';
  //   this.workoutPlanService.updateWorkoutPlan(plan, this.userId);
  // }

  async deleteWorkoutPlan() {
    await this.workoutPlanService.deleteWorkoutPlan(this.userId);
    this.load()
    this.getWorkoutPlan()
  }
}
