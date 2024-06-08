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
    targetWeight: string;
  }