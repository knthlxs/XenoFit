import { Timestamp } from "firebase/firestore";

export class Workouts {
    id: string;
    name: string;
    exerciseCount: number;
    imageUrl: string;
    exerciseName: string;
    exerciseImage: string;
    instruction1: string;
    instruction2: string;
    instruction3: string;
    instruction4: string;
    instruction5: string;
    type: string;
    reps: number;
    sets: number;
    startingTime: number;
    workout: [];
    date: Timestamp;
    streak: number;
    highestStreak: number;
    totalWorkoutDays: number;
    lastWorkoutDate: number;
    intensity: number;
    workoutDates: []
}

export interface iWorkouts {
    id: string,
    name: string,
    exerciseCount: number,
    imageUrl: string
    exerciseName: string,
    exerciseImage: string,
    instruction1: string,
    instruction2: string,
    instruction3: string,
    instruction4: string,
    instruction5: string,
    type: string,
    reps: number,
    sets: number
    startingTime: number;
    workout: [];
    date: Timestamp;
    streak: number;
    highestStreak: number;
    totalWorkoutDays: number;
    lastWorkoutDate: number;
    intensity: number;
    workoutDates: []
}
// export class Exercise {
//     id: string = "";
//     name: string = "";
//     reps: number = 0;
//     sets: number = 0;
// }
// export interface iExercise {
//     id: string,
//     exercise_name: string,
//     reps: number,
//     sets: number
// }