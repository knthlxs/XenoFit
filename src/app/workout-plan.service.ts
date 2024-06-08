// src/app/services/workout-plan.service.ts
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, limit, query, setDoc, where } from 'firebase/firestore';
import { environment } from 'src/environments/environment';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  exercises: Exercise[];
  level: string;
  bodyComposition: string;
  goals: string[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutPlanService {
  workoutDuration: number;
  workoutFrequency: number;
  totalCaloriesBurned: number;

  constructor() { }

  async fetchWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);

    const userDocRef = doc(db, "users", userId); // Get the user by id
    const workoutPlansRef = collection(userDocRef, "workoutPlans");

    const snapshot = await getDocs(workoutPlansRef);


    const plans: WorkoutPlan[] = []

    snapshot.forEach(el => {
      const plan = el.data() as WorkoutPlan;
      plans.push(plan);
    })

    return plans;
  }

  async addWorkoutPlan(userId: string) {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);

    const userDocRef = doc(db, "users", userId); // Get the user by id
    const workoutPlansRef = collection(userDocRef, "workoutPlans");

    const plan = {

    }

    await addDoc(workoutPlansRef, plan);
    await this.fetchWorkoutPlans(userId);
  }

  // async updateWorkoutPlan(updatedPlan: WorkoutPlan, userId: string) {
  //   const app = initializeApp(environment.firebaseConfig);
  //   const db = getFirestore(app);
  //     const { id, ...planData } = updatedPlan;
  //     const userDocRef = doc(db, "users", userId); // Get the user by id
  //     const workoutPlansRef = collection(userDocRef, "workoutPlans"); 
  //     const docRef = doc(workoutPlansRef, id);
  //   await setDoc(docRef, planData);
  //   await this.fetchWorkoutPlans(userId);
  // }

  async deleteWorkoutPlan(userId: string) {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);
    const userDocRef = doc(db, "users", userId); // Get the user by id
    const workoutPlansRef = collection(userDocRef, "workoutPlans");

    const workoutPlansSnapshot = await getDocs(workoutPlansRef);

    // Delete the document returned by the query
    workoutPlansSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    // Fetch updated workout plans
    await this.fetchWorkoutPlans(userId);
  }

  async setWorkoutFrequency(userId: string, workoutFrequency: number, totalCaloriesBurned: number) {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);

    const userDocRef = doc(db, "users", userId); // Reference to the user document
    const workoutPlansRef = collection(userDocRef, "workoutPlans"); // Reference to the workoutPlans subcollection

    const plan = {
      numberOfDays: workoutFrequency,
      totalCaloriesBurned: totalCaloriesBurned
    };

    // Check if there is any document in the workoutPlans subcollection
    const workoutPlansQuery = query(workoutPlansRef, limit(1));
    const querySnapshot = await getDocs(workoutPlansQuery);

    if (!querySnapshot.empty) {
      // If a document exists, get its ID and update it
      const existingDoc = querySnapshot.docs[0];
      const existingDocRef = doc(workoutPlansRef, existingDoc.id);
      await setDoc(existingDocRef, plan, { merge: true }); // Use merge to update the document
    } else {
      // If no document exists, create a new one
      await addDoc(workoutPlansRef, plan);
    }

    await this.fetchWorkoutPlans(userId); // Assuming fetchWorkoutPlans is a defined function elsewhere in your code
  }

  async getWorkoutFrequency(userId: string) {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);

    const userDocRef = doc(db, "users", userId); // Get the user by id
    const workoutPlansRef = collection(userDocRef, "workoutPlans");

    const snapshot = await getDocs(workoutPlansRef);


    const plans: WorkoutPlan[] = []

    snapshot.forEach(el => {
      const plan = el.data() as WorkoutPlan;
      plans.push(plan);
    })

    return plans;
  }

  async fetchTargetWeight(userId: string): Promise<WorkoutPlan[]> {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);

    const userDocRef = doc(db, "users", userId); // Get the user by id
    const workoutPlansRef = collection(userDocRef, "targetWeight");

    const snapshot = await getDocs(workoutPlansRef);


    const plans: WorkoutPlan[] = []

    snapshot.forEach(el => {
      const plan = el.data() as WorkoutPlan;
      plans.push(plan);
    })

    return plans;
  }

  async setTargetWeight(userId: string, weightCurrentIn: number, weightTargetIn:number, daysToTargetWeight: number, startingDateStr: string, endDateStr: string) {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);

    const userDocRef = doc(db, "users", userId); // Reference to the user document
    const workoutPlansRef = collection(userDocRef, "targetWeight"); // Reference to the workoutPlans subcollection

    const plan = {
      weightCurrentIn:Number(weightCurrentIn),
      weightTargetIn:Number(weightTargetIn),
      daysToTargetWeight: Number(daysToTargetWeight),
      startingDateStr: startingDateStr,
      endDateStr: endDateStr
    };

    // Check if there is any document in the workoutPlans subcollection
    const workoutPlansQuery = query(workoutPlansRef);
    const querySnapshot = await getDocs(workoutPlansQuery);

    if (!querySnapshot.empty) {
      // If a document exists, get its ID and update it
      const existingDoc = querySnapshot.docs[0];
      const existingDocRef = doc(workoutPlansRef, existingDoc.id);
      await setDoc(existingDocRef, plan, { merge: true }); // Use merge to update the document
    } else {
      // If no document exists, create a new one
      await addDoc(workoutPlansRef, plan);
    }

    await this.fetchTargetWeight(userId);
  }

  async deleteTargetWeight(userId: string) {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);
    const userDocRef = doc(db, "users", userId); // Get the user by id
    const workoutPlansRef = collection(userDocRef, "targetWeight");

    const workoutPlansSnapshot = await getDocs(workoutPlansRef);

    // Delete the document returned by the query
    workoutPlansSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    // Fetch updated workout plans
    await this.fetchTargetWeight(userId);
  }

  //  For health calculator database
  async fetchHealthCalculator(userId: string): Promise<WorkoutPlan[]> {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);

    const userDocRef = doc(db, "users", userId); // Get the user by id
    const workoutPlansRef = collection(userDocRef, "healthCalculator");

    const snapshot = await getDocs(workoutPlansRef);
    const plans: WorkoutPlan[] = []

    snapshot.forEach(el => {
      const plan = el.data() as WorkoutPlan;
      plans.push(plan);
    })

    return plans;
  }

  async setHealthCalculator(userId: string, calories: number, protein: number, fat: number, carbohydrates: number) {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);

    const userDocRef = doc(db, "users", userId); // Reference to the user document
    const workoutPlansRef = collection(userDocRef, "healthCalculator"); // Reference to the workoutPlans subcollection

    const plan = {
      calories: calories.toFixed(2),
      protein: protein.toFixed(2),
      fat: fat.toFixed(2),
      carbohydrates: carbohydrates.toFixed(2)
    };

    // Check if there is any document in the workoutPlans subcollection
    const workoutPlansQuery = query(workoutPlansRef);
    const querySnapshot = await getDocs(workoutPlansQuery);

    if (!querySnapshot.empty) {
      // If a document exists, get its ID and update it
      const existingDoc = querySnapshot.docs[0];
      const existingDocRef = doc(workoutPlansRef, existingDoc.id);
      await setDoc(existingDocRef, plan, { merge: true }); // Use merge to update the document
    } else {
      // If no document exists, create a new one
      await addDoc(workoutPlansRef, plan);
    }

    await this.fetchHealthCalculator(userId);
  }

  async deleteHealthCalculator(userId: string) {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);
    const userDocRef = doc(db, "users", userId); // Get the user by id
    const workoutPlansRef = collection(userDocRef, "healthCalculator");

    const workoutPlansSnapshot = await getDocs(workoutPlansRef);

    // Delete the document returned by the query
    workoutPlansSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    // Fetch updated workout plans
    await this.fetchHealthCalculator(userId);
  }

}
