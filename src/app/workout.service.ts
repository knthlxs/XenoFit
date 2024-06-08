import { Injectable } from '@angular/core';
import { addDoc, collection, getFirestore, getDocs, updateDoc, doc, deleteDoc, query, where, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';
import { Workouts, iWorkouts } from './models/workout.model';
import { Qoutes } from './models/qoutes.model';
import { SignupService } from './signup.service';
@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  workout: Workouts = new Workouts();
  workoutList: iWorkouts[] = [];
  workoutDoneList: any
  exerciseId: string = ""
  historyIndex: number
  workoutIndex: number

  // streak: number;
  // totalWorkoutDays: number;
  // lastWorkoutDate: Date | null = null;
  // highestStreak: number ;

  constructor(private signupServ: SignupService) { }

  ngOnInit() {
  }

  calculateStreaks(lastWorkoutDate: Date | null) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set current date to start of the day for comparison
  
    console.log("Current Date:", currentDate);
  
    if (!lastWorkoutDate) {
      // If there's no last workout date, start the streak and set totalWorkoutDays to 1
      this.streakList[0].streak = 1; // Start the streak at 1
      this.streakList[0].totalWorkoutDays = 1;
  
      // Update last workout date
      this.streakList[0].lastWorkoutDate = currentDate;
  
      console.log("Streak:", this.streakList[0].streak);
      return;
    }
  
    // Calculate the difference in days between current date and last workout date
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round((currentDate.getTime() - lastWorkoutDate.getTime()) / oneDay);
  
    console.log("Last Workout Date:", lastWorkoutDate);
    console.log("Difference in days:", diffDays);
  
 
  

    if (diffDays === 1) {
      // If the last workout date is the previous day, increment the streak and totalWorkoutDays
      this.streakList[0].streak++;
      this.streakList[0].totalWorkoutDays++;
    } else if (diffDays > 1) {
    // Update highest streak if current streak exceeds it
    if (this.streakList[0].streak > this.streakList[0].highestStreak) {
      this.streakList[0].highestStreak = this.streakList[0].streak;
      console.log('Personal best streak is lower: ' + this.streakList[0].highestStreak + ' than ' + this.streakList[0].streak);
    }
 

      // If the last workout date is more than one day ago, reset the streak and increment totalWorkoutDays
      this.streakList[0].streak = 1; // Reset streak to 1 since the user is working out today
      this.streakList[0].totalWorkoutDays++; // Increment total workout days whenever the user works out after a day
    }
   
    
    // Update last workout date
    this.streakList[0].lastWorkoutDate = currentDate;
  
    console.log("Streak:", this.streakList[0].streak);
}

streakList:any = []
  // Add done workout to history 
  async addToHistory(exerciseList: any, userId: string, caloriesBurned: any, exerciseTimes: any) {
    try {
      const app = initializeApp(environment.firebaseConfig);
      const db = getFirestore(app);

this.streakList = await this.getStreak(userId);

      const userDocRef = doc(db, "users", userId);
      const historyColRef = collection(userDocRef, "history");
      const workoutDateColRef = collection(userDocRef, "workoutDate");

      // Fetch the last workout date from Firestore
      const streakDocRef = doc(collection(userDocRef, "streak"), userId);
      const streakSnapshot = await getDoc(streakDocRef);

      if (streakSnapshot.exists()) {
        const streakData = streakSnapshot.data() as any;
        const lastWorkoutDate = streakData.lastWorkoutDate ? new Date(streakData.lastWorkoutDate) : null;
        
        // Calculate streaks based on the last workout date
        this.calculateStreaks(lastWorkoutDate);
        console.log('Streak: ' + this.streakList[0].streak);
        console.log('totalWorkoutDays: ' + this.streakList[0].totalWorkoutDays);
        console.log('highestStreak: ' + this.streakList[0].highestStreak);

        // Update streak data in Firestore
        await setDoc(streakDocRef, {
          streak: this.streakList[0].streak,
          totalWorkoutDays: this.streakList[0].totalWorkoutDays,
          lastWorkoutDate: this.streakList[0].lastWorkoutDate?.toISOString(),
          highestStreak: this.streakList[0].highestStreak
        }, { merge: true });
      } else {
        // If streak document doesn't exist, initialize streak data
        await setDoc(streakDocRef, {
          streak: 1,
          totalWorkoutDays: 1,
          lastWorkoutDate: new Date().toISOString(),
          highestStreak: 1
        });
      }
// Get the current date and time in the Philippines (UTC+8)
const currentDate = new Date();

currentDate.setUTCHours(currentDate.getUTCHours() + 8);
      // Add the workout to the history
      await addDoc(historyColRef, {
        workout: exerciseList,
        date: currentDate.toISOString(), // Add a timestamp for when the workout was completed
        caloriesBurned: caloriesBurned,
        exerciseTimes: exerciseTimes
      });

      // Update workout dates
      currentDate.setHours(0, 0, 0, 0);
      const currentLocalDate = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000);

      // Fetch the current workout dates from Firestore
      const workoutDateSnapshot = await getDocs(workoutDateColRef);
      let workoutDateDocId: string | null = null;
      let currentWorkoutDates: string[] = [];

      workoutDateSnapshot.forEach((doc) => {
        workoutDateDocId = doc.id;
        currentWorkoutDates = doc.data()['workoutDates'];
      });

      // Check if the current date is already in the set
      if (!currentWorkoutDates.includes(currentLocalDate.toISOString())) {
        // If not, add the current date to the array
        currentWorkoutDates.push(currentLocalDate.toISOString());

        // Add or update the workout dates document in Firestore
        if (workoutDateDocId) {
          // Update the existing document
          await updateDoc(doc(workoutDateColRef, workoutDateDocId), {
            workoutDates: currentWorkoutDates,
            textColor: '#800080',
            backgroundColor: '#ffc0cb',
          });
        } else {
          // Create a new document
          await addDoc(workoutDateColRef, {
            workoutDates: currentWorkoutDates,
            textColor: '#800080',
            backgroundColor: '#ffc0cb',
          });
        }
      }

      this.signupServ.presentToast('Workout Finished.You did well!'); 
    } catch (error) {
      console.error("Error adding workout to history:", error);
      this.signupServ.presentToast('An error has occurred while adding workout to history. Please try again later.');
    }
  }

  async getUserInfo(userId: string) {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);

    const userDocRef = doc(db, "users", userId);

    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            // console.log("User data:", userData);
            return userData;
        } else {
            console.log("No such document exists!");
            return null;
        }
    } catch (error) {
        console.error("Error getting user document:", error);
        throw error;
    }
}


  // For showing information of specific workout
  async getSpecificInstruction(userId: string, type: string, id: string): Promise<iWorkouts[]> {
    console.log(id);

    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);

    const userDocRef = doc(db, "users", userId);
    const workoutsColRef = collection(userDocRef, "workouts");
    const categoryDocRef = doc(workoutsColRef, type);
    const specificWorkoutsColRef = collection(categoryDocRef, "specificWorkouts");
    const workoutOne = query(specificWorkoutsColRef, where('id', '==', id));
    const querySnapshot = await getDocs(workoutOne);

    const workouts: Workouts[] = []

    querySnapshot.forEach(el => {
      const workout = el.data() as Workouts;
      workouts.push(workout);
    })

    return workouts;
  }

  // For updating reps and sets
  async updateWorkout(workout: Workouts, userId: string, type: string, id: string) {
    try {
      const app = initializeApp(environment.firebaseConfig);
      const db = getFirestore(app);

      const userDocRef = doc(db, "users", userId); // Get the user by id
      const workoutsColRef = collection(userDocRef, "workouts"); // Get the workout collection inside the specific user id
      const categoryDocRef = doc(workoutsColRef, type);
      const specificWorkoutsColRef = collection(categoryDocRef, "specificWorkouts");
      const workoutOne = query(specificWorkoutsColRef, where('id', '==', id));
      const querySnapshot = await getDocs(workoutOne);

      const workouts: Workouts[] = []

      querySnapshot.forEach(async doc => {
        // Update the document
        await updateDoc(doc.ref, {
          reps: workout.reps,
          sets: workout.sets,
          startingTime: workout.startingTime,
        });
      })
      this.signupServ.presentToast('Updated successfully.')
      return workouts;
    } catch (error) {
      this.signupServ.presentToast('An error has occured while updating. Please try again later.')
      return []
    }
  }


  async readWorkoutDate(userId: string): Promise<iWorkouts[]> {
    const app = initializeApp(environment.firebaseConfig); // Initialize Firebase
    const db = getFirestore(app); // Initialize Cloud Firestore and get a reference to the service

    const workoutDateList: Workouts[] = []

    const userDocRef = doc(db, "users", userId); // Go to document inside the collection of users based on userId
    const historyColRef = collection(userDocRef, "workoutDate");

    const querySnapshot = await getDocs(historyColRef);

    querySnapshot.forEach((doc) => {
      const workoutDate = doc.data() as Workouts;
      workoutDate.id = doc.id;
      workoutDateList.push(workoutDate);
    });
    return workoutDateList;
  }

  // Read/Get history
  async readHistory(userId: string): Promise<iWorkouts[]> {
    const app = initializeApp(environment.firebaseConfig); // Initialize Firebase
    const db = getFirestore(app); // Initialize Cloud Firestore and get a reference to the service

    const historyList: Workouts[] = []

    const userDocRef = doc(db, "users", userId); // Go to document inside the collection of users based on userId
    const historyColRef = collection(userDocRef, "history");

    const querySnapshot = await getDocs(historyColRef);

    querySnapshot.forEach((doc) => {
      const history = doc.data() as Workouts;
      history.id = doc.id;
      historyList.push(history);
    });
    return historyList;
  }

  async getStreak(userId: string) {
    const app = initializeApp(environment.firebaseConfig); // Initialize Firebase
    const db = getFirestore(app); // Initialize Cloud Firestore and get a reference to the service

    const streakList: Workouts[] = []

    const userDocRef = doc(db, "users", userId); // Go to document inside the collection of users based on userId
    const streakColRef = collection(userDocRef, "streak");

    const querySnapshot = await getDocs(streakColRef);


    querySnapshot.forEach(async doc => {
      // Update the document
      const streak = doc.data() as Workouts

      streakList.push(streak)
    })

    return streakList;
  }

  async checkAndUpdateStreak(userId: string): Promise<void> {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);

    const userDocRef = doc(db, "users", userId);
    const streakDocRef = doc(collection(userDocRef, "streak"), userId);
    const streakSnapshot = await getDoc(streakDocRef);

    if (streakSnapshot.exists()) {
      const streakData = streakSnapshot.data() as Workouts;

      const lastWorkoutDate = new Date(streakData.lastWorkoutDate);
      const currentDate = new Date();

      lastWorkoutDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((currentDate.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        streakData.streak = 0; // Reset streak if the difference is more than 1 day
      }

      // Update Firestore
      await setDoc(streakDocRef, streakData, { merge: true });
    }
  }

  updateStreak(userId: string, streakData: any) {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);
    const userDocRef = doc(db, "users", userId);
    const streakDocRef = doc(collection(userDocRef, "streak"), userId);

    return setDoc(streakDocRef, streakData, { merge: true });
  }

  // Get qoutes
  async getQoutes() {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);
  
    const qoutesList: Workouts[] = [];
  
    // Reference to the qoutes collection
    const qoutesColRef = collection(db, "qoutes");
  
    // Get all documents from the qoutes collection
    const querySnapshot = await getDocs(qoutesColRef);
  
    querySnapshot.forEach((doc) => {
      // Update the document
      const qoutes = doc.data() as Workouts;
      qoutesList.push(qoutes);
    });
  
    return qoutesList;
  }

}
