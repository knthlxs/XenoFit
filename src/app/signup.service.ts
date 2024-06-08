import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { environment } from 'src/environments/environment';
import { Workouts, iWorkouts } from './models/workout.model';
import { WorkoutPlan } from './workout-plan.service';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  email: string = "";
  password: string = "";
  reEnterPassword: string = "";
  time: number = 1000;
  user: string

  constructor(private toastController: ToastController, private alertController: AlertController) { }

  async presentToast(messageStr: string) {
    const toast = await this.toastController.create({
      message: messageStr,
      duration: 2000
    })
    await toast.present();
  }
  async getUser(userId: string) {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);

    const userDocRef = doc(db, "users", userId); // Get the user by id
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User not found!');
    }
    return userDoc.data();
  }

  async updateUser(userId: string, userName: string, userWeight: number, userHeight: number) {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);

    const userDocRef = doc(db, "users", userId);
    const meters = userHeight / 100;
    // Set user BMI
    let bmi = ((userWeight) / (meters * meters));
    let classification;
    if (bmi >=30) {
      classification = 'Obesity'
    } else if (bmi <30 && bmi >= 25){
      classification = 'Overwieght'
    } else if (bmi < 25 && bmi >= 18.5) {
      classification = 'Healthy Weight'
    } else {
      classification = 'Underweight'
    }
    try {
      await updateDoc(userDocRef, {
        name: userName,
        weight: userWeight,
        height: userHeight,
        bmi: bmi,
        classification: classification
      });
      this.presentToast('Profile updated successfully')
    } catch (error) {
      this.presentToast('An error has occured while updating your profile')

    }
  }

  async signup(email: string, password: string, reEnterPassword: string, name: string, weight: number, height: number, age: number, gender: string) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password || !reEnterPassword) {
          return reject("Incomplete fields");
        }

        if (password !== reEnterPassword) {
          return reject("Incorrect credentials");
        }



        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email, password)
          .then(userCredential => {
            const user = userCredential.user;
            console.log(user.email);

            this.createWorkoutsSubCollections(user.uid, user.email, name, weight, height, age, gender)
              .then(() => {
                resolve("Success");
              })
              .catch((error) => {
                reject(error);
              });
          })
          .catch((error) => {
            const errorCode = error.code;
            if (errorCode === "auth/weak-password") {
              reject("Invalid password");
            } else if (errorCode === "auth/email-already-in-use") {
              reject("Invalid email");
            } else {
              reject("Error signing up");
            }
          });
      }, this.time);
    });
  }

  async createWorkoutsSubCollections(userId: string, email: string | null, name: string, weight: number, height: number, age: number, gender: string) {
    const app = initializeApp(environment.firebaseConfig);
    const db = getFirestore(app);
    const meters = height/100;
    // Set user BMI
    let bmi = ((weight) / (meters * meters));
    let classification;
    if (bmi >=30) {
      classification = 'Obesity'
    } else if (bmi <30 && bmi >= 25){
      classification = 'Overwieght'
    } else if (bmi < 25 && bmi >= 18.5) {
      classification = 'Healthy Weight'
    } else {
      classification = 'Underweight'
    }
    // Create user document with the userId
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, { email, name, weight, height, bmi, age, gender, classification });

    // Create the 'workouts' subcollection for the specific user
    const workoutSubColRef = collection(userDocRef, "workouts");

    // To be added (default for all user)
    const workoutData = [
      {
        id: "abs", name: "Abs Workout", exerciseCount: 5, imageUrl: "/assets/images/abs-workout.jpg", sets: 3, specificWorkouts: [
          {
            id: "jumpingJacks",
            exerciseName: "Jumping Jacks",
            exerciseImage: "/assets/images/abs/jumping-jacks.jpg",
            instruction1: "Start with your feet together and your arms by your sides, then jump up with your feet apart and your hands overhead.",
            instruction2: "Return to the start position then do the next rep. This exercise provides a full-body workout and works all your large muscle groups.",
            instruction3: "It primary works the rectus abdominis muscle and obliques",
            reps: 20,
            sets: 3,
            type: "abs",
            startingTime: 30,
            intensity: 3
          },
          {
            id: "abdominalCrunches",
            exerciseName: "Abdominal Crunches",
            exerciseImage: "/assets/images/abs/abdominal-crunches.png",
            instruction1: "Lie on your back with your knees bent and your arms stretched forward.",
            instruction2: "Then lift your upper body off the floor. Hold for a few seconds and slowly return.",
            instruction3: "It primary works the rectus abdominis muscle and obliques",
            reps: 20,
            sets: 3,
            type: "abs",
            startingTime: 60,
            intensity: 5
          },
          {
            id: "legRaise",
            exerciseName: "Leg Raises",
            exerciseImage: "/assets/images/abs/leg-raise.jpg",
            instruction1: "Lie down on your back, and put your hands beneath your hips for support.",
            instruction2: "Then lift your legs up until they form a right angle with the floor.",
            instruction3: "Slowly bring your legs back down and repeat the exercise",
            reps: 16,
            sets: 3,
            type: "abs",
            startingTime: 120,
            intensity: 8
          },
          {
            id: "russianTwist",
            exerciseName: "Russian Twist",
            exerciseImage: "/assets/images/abs/russian-twist.jpg",
            instruction1: "Sit on the floor with your knees bent, feet lifted a little bit and back tilted backwards.",
            instruction2: "Then hold your hands together and twist from side to side.",
            instruction3: "",
            reps: 32,
            sets: 3,
            type: "abs",
            startingTime: 90,
            intensity: 3
          },
          {
            id: "plank",
            exerciseName: "Plank",
            exerciseImage: "/assets/images/abs/plank.jpg",
            instruction1: "Lie on the floor with your toes and forearms on the ground. Keep your body straight and hold this position as long as you can.",
            instruction2: "Don't hold your breath. Breathe normally from your abdomen of your chest.",
            instruction3: "This exercise strengthens the abdomen, back and shoulders.",
            reps: 0,
            sets: 3,
            type: "abs",
            startingTime: 30,
            intensity: 5
          }
        ]
      },
      {
        id: "arms", name: "Arms Workout", exerciseCount: 7, imageUrl: "/assets/images/arm-workout.jpg", sets: 3, specificWorkouts: [

          {
            id: "jumpingJacks",
            exerciseName: "Jumping Jacks",
            exerciseImage: "/assets/images/arm/jumping-jacks.jpg",
            instruction1: "Start with your feet together and your arms by your sides, then jump up with your feet apart and your hands overhead.",
            instruction2: "Return to the start position then do the next rep. This exercise provides a full-body workout and works all your large muscle groups.",
            instruction3: "It primary works the rectus abdominis muscle and obliques",
            reps: 20,
            sets: 3,
            type: "arms",
            startingTime: 30,
            intensity: 3
          },
          {
            id: "armRaises", exerciseName: "Arm Raises", exerciseImage: "/assets/images/arm/arm-raises.png",
            instruction1: "Stand on the floor with your arms extended straight forward at shoulder height.",
            instruction2: "Exhale, raise your arms above your head. Inhale, return to the start position and repeat.",
            instruction3: "",
            reps: 20,
            sets: 3,
            type: "arms",
            startingTime: 60,
            intensity: 3
          },
          {
            id: "sideArmRaise", exerciseName: "Side Arm Raise", exerciseImage: "/assets/images/arm/side-arm-raise.jpg",
            instruction1: "Stand your feet shoulder width apart.",
            instruction2: "Raise your arms to the sides at shoulder height, then put them down.", instruction3: "Repeat the exercise. Keep your arms straight during the exercise.",
            reps: 20,
            sets: 3,
            type: "arms",
            startingTime: 60,
            intensity: 3
          },
          {
            id: "armCirclesClockwise", exerciseName: "Arm Circles Clockwise", exerciseImage: "/assets/images/arm/arm-circles-clockwise.jpg",
            instruction1: "Stand on the floor with your arms extended straight out to the sides at shoulder height.",
            instruction2: "Move your arms clockwise in circles fast.",
            instruction3: "Do it as fast as you can.",
            reps: 20,
            sets: 3,
            type: "arms",
            startingTime: 60,
            intensity: 3
          },
          {
            id: "armCirclesCounterClockwise", exerciseName: "Arm Circles Counter Clockwise", exerciseImage: "/assets/images/arm/arm-circles-counter-clockwise.jpg",
            instruction1: "Stand on the floor with your arms extended straight out to the sides at shoulder height.",
            instruction2: "Move your arms clockwise in circles fast.",
            instruction3: "Do it as fast as you can.",
            reps: 20,
            sets: 3,
            type: "arms",
            startingTime: 60,
            intensity: 3
          },
          {
            id: "pushUps", exerciseName: "Push-Ups", exerciseImage: "/assets/images/arm/push-ups.jpg",
            instruction1: "Lay prone on the ground with arms supporting your body.",
            instruction2: "Keep your body straight while raising and lowering your body with your arms.", instruction3: "This exercise works the chest, shoulders, triceps, back and legs.",
            reps: 10,
            sets: 3,
            type: "arms",
            startingTime: 60,
            intensity: 8
          },
          {
            id: "tricepsDips", exerciseName: "Triceps Dips", exerciseImage: "/assets/images/arm/triceps-dips.jpg",
            instruction1: "For the start position, sit on the chair. Then move your hip off the chair with your hands holding the edge of the chair.",
            instruction2: "Slowly bend and stretch your arms to make your body go up and down. This is a great exercise for the triceps.",
            instruction3: "",
            reps: 10,
            sets: 3,
            type: "arms",
            startingTime: 60,
            intensity: 8
          }
        ]
      },
      {
        id: "chest", name: "Chest Workout", exerciseCount: 5, imageUrl: "/assets/images/chest-workout.jpg", sets: 3, specificWorkouts: [
          {
            id: "jumpingJacks",
            exerciseName: "Jumping Jacks",
            exerciseImage: "/assets/images/chest/jumping-jacks.jpg",
            instruction1: "Start with your feet together and your arms by your sides, then jump up with your feet apart and your hands overhead.",
            instruction2: "Return to the start position then do the next rep. This exercise provides a full-body workout and works all your large muscle groups.",
            instruction3: "It primary works the rectus abdominis muscle and obliques",
            reps: 20,
            sets: 3,
            type: "chest",
            startingTime: 30,
            intensity: 3
          },
          {
            id: "inclinePushUp", exerciseName: "Incline Push-Ups", exerciseImage: "/assets/images/chest/incline-push-ups.jpg",
            instruction1: "Start in a regular push-up position but with your hands elevated on a chair or bench.",
            instruction2: "Then push your body up down using your arm strength.",
            instruction3: "Remember to keep your body straight.",
            reps: 16,
            sets: 3,
            type: "chest",
            startingTime: 150,
            intensity: 5
          },
          {
            id: "pushUps", exerciseName: "Push-Ups", exerciseImage: "/assets/images/chest/push-ups.jpg",
            instruction1: "Lay prone on the ground with arms supporting your body.",
            instruction2: "Keep your body straight while raising and lowering your body with your arms.", instruction3: "This exercise works the chest, shoulders, triceps, back and legs.",
            reps: 10,
            sets: 3,
            type: "chest",
            startingTime: 60,
            intensity: 8
          },
          {
            id: "wideArmPushUps", exerciseName: "Wide Arm Push-Ups", exerciseImage: "/assets/images/chest/wide-arm-push-ups.jpg",
            instruction1: "Start in the regular push-up position but with your hands spread wider than your shoulders.",
            instruction2: "Then push your body up and down. Remember to keep your body straight.",
            instruction3: "",
            reps: 10,
            sets: 3,
            type: "chest",
            startingTime: 60,
            intensity: 8
          },
          {
            id: "kneePushUps", exerciseName: "Knee Push-Ups", exerciseImage: "/assets/images/chest/knee-push-ups.jpg",
            instruction1: "Start in the regular push-up position, then let your knees touch the floor and raise your feet up off the floor.",
            instruction2: "Next push your body up and down.",
            instruction3: "",
            reps: 12,
            sets: 3,
            type: "chest",
            startingTime: 60,
            intensity: 5
          },
        ]
      },
      {
        id: "leg", name: "Leg Workout", exerciseCount: 7, imageUrl: "/assets/images/leg-workout.jpg", sets: 3, specificWorkouts: [
          {
            id: "sideHop", exerciseName: "Side Hop", exerciseImage: "/assets/images/leg/side-hop.jpg",
            instruction1: "Stand on the floor, put your hands in front of you and hop from side to side.",
            instruction2: "",
            instruction3: "",
            reps: 30,
            sets: 3,
            type: "leg",
            startingTime: 80,
            intensity: 8
          },
          {
            id: "squats", exerciseName: "Squats", exerciseImage: "/assets/images/leg/squats.jpg",
            instruction1: "Stand with your feet shoulder width apart and your arms stretched forward, then lower your body until your thighs are parallel with the floor.",
            instruction2: "Your knees should be extended in the same direction as your toes. Return to the start position and do the next rep.",
            instruction3: "This works the thighs, hips, buttocks, quads, hamstrings and lower body.",
            reps: 12,
            sets: 3,
            type: "leg",
            startingTime: 80,
            intensity: 5
          },
          {
            id: "squats", exerciseName: "Squats", exerciseImage: "/assets/images/leg/squats.jpg",
            instruction1: "Stand with your feet shoulder width apart and your arms stretched forward, then lower your body until your thighs are parallel with the floor.",
            instruction2: "Your knees should be extended in the same direction as your toes. Return to the start position and do the next rep.",
            instruction3: "This works the thighs, hips, buttocks, quads, hamstrings and lower body.",
            reps: 12,
            sets: 3,
            type: "leg",
            startingTime: 80,
            intensity: 8
          },
          {
            id: "forwardLunge", exerciseName: "Forward Lunge", exerciseImage: "/assets/images/leg/forward-lunge.jpg",
            instruction1: "Stand with your feet shoulder width apart and your hands on your hips.",
            instruction2: "Step a big step forward with your right leg and lower your body until your left thigh is parallel to the floor. Return and repeat with the other side.",
            instruction3: "",
            reps: 14,
            sets: 3,
            type: "leg",
            startingTime: 60,
            intensity: 5
          },
          {
            id: "backwardLunge", exerciseName: "Backward Lunge", exerciseImage: "/assets/images/leg/backward-lunge.jpg",
            instruction1: "Stand with your feet shoulder width apart and your hands on your hips.",
            instruction2: "Step a big step backward with your right leg and lower your body until your left thigh is parallel to the floor. Return and repeat with the other side.",
            instruction3: "",
            reps: 14,
            sets: 3,
            type: "leg",
            startingTime: 60,
            intensity: 5
          },
          {
            id: "calfStretchLeft", exerciseName: "Calf Stretch Left", exerciseImage: "/assets/images/leg/calf-stretch.jpg",
            instruction1: "Stand one big step away in front of a wall. Step forward with your right foot and push the wall with your hands.",
            instruction2: "Please make sure your left leg is fully extended and you can fell your left calf stretching. Hold this position for a few seconds.",
            instruction3: "",
            reps: 0,
            sets: 3,
            type: "leg",
            startingTime: 30,
            intensity: 3
          },
          {
            id: "calfStretchRight", exerciseName: "Calf Stretch Right", exerciseImage: "/assets/images/leg/calf-stretch.jpg",
            instruction1: "Stand one big step away in front of a wall. Step forward with your right foot and push the wall with your hands.",
            instruction2: "Please make sure your right leg is fully extended and you can fell your right calf stretching. Hold this position for a few seconds.",
            instruction3: "",
             reps: 0,
            sets: 3,
            type: "leg",
            startingTime: 30,
            intensity: 3
          }
        ]
      },
      {
        id: "shoulderBack", name: "Shoulder & Back Workout", exerciseCount: 5, imageUrl: "/assets/images/shoulder&back-workout.jpg", sets: 3, specificWorkouts: [
          {
            id: "jumpingJacks",
            exerciseName: "Jumping Jacks",
            exerciseImage: "/assets/images/shoulders&back/jumping-jacks.jpg",
            instruction1: "Start with your feet together and your arms by your sides, then jump up with your feet apart and your hands overhead.",
            instruction2: "Return to the start position then do the next rep. This exercise provides a full-body workout and works all your large muscle groups.",
            instruction3: "It primary works the rectus abdominis muscle and obliques.",
            reps: 20,
            sets: 3,
            type: "shoulderBack",
            startingTime: 30,
            intensity: 3
          },
          {
            id: "rhomboidPulls",
            exerciseName: "Rhomboid Pulls",
            exerciseImage: "/assets/images/shoulders&back/rhomboid-pulls.jpg",
            instruction1: "Stand with your feet shoulders width apart.",
            instruction2: "Raise your arms parallel to the ground, and bend your elbows. Pull your elbows back and squeeze your shoulder blades.",
            instruction3: "Repeat this exercise.",
            reps: 14,
            sets: 3,
            type: "shoulderBack",
            startingTime: 60,
            intensity: 5
          },
          {
            id: "armScissors",
            exerciseName: "Arm Scissors",
            exerciseImage: "/assets/images/shoulders&back/arm-scissors.jpg",
            instruction1: "Stand upright with your feet shoulder width apart.",
            instruction2: "Stretch your arms in front of you at shoulder height with one arm overlap the other in the shape of the letter 'X', and then spread them apart.",
            instruction3: "Switch arms, and repeat the exercise.",
            reps: 20,
            sets: 3,
            type: "shoulderBack",
            startingTime: 60,
            intensity: 5
          },
          {
            id: "proneTricepsPushUps",
            exerciseName: "Prone Triceps Push-Ups",
            exerciseImage: "/assets/images/shoulders&back/prone-triceps-push-ups.jpg",
            instruction1: "Lie on your stomach with your hands underneath your shoulders and your elbows bent.",
            instruction2: "Slightly raise your chest up, and then go back to the start position.",
            instruction3: "Repeat this exercise.",
            reps: 14,
            sets: 3,
            type: "shoulderBack",
            startingTime: 90,
            intensity: 5
          },
          {
            id: "childPose", exerciseName: "Child's Pose", exerciseImage: "/assets/images/shoulders&back/child-pose.jpg",
            instruction1: "Start with your knees and hands on the floor. Put your hands a little forward, widen your knees and put your toes together.",
            instruction2: "Take a breath, then exhale and sit  back. Try to make your butt touch your heels. Relax your elbows, make your forehead touch the floor and try to lower your chest close to the floor. Hold this position.",
            instruction3: "Keep your arms stretched forward as you sit back. Make sure there is enough space between your shoulders and ears during exercise.",
            reps: 0,
            sets: 3,
            type: "shoulderBack",
            startingTime: 30,
            intensity: 3
          }
        ]
      }
    ];

    const promises = workoutData.map(async workout => {
      const workoutDocRef = doc(workoutSubColRef, workout.id);
      // workout collection
      await setDoc(workoutDocRef, {
        name: workout.name,
        exerciseCount: workout.exerciseCount,
        imageUrl: workout.imageUrl,
        sets: workout.sets
      });
      // specific workout collection
      const specificWorkoutPromises = workout.specificWorkouts.map(specificWorkout => {
        const specificWorkoutColRef = collection(workoutDocRef, "specificWorkouts");
        const specificWorkoutDocRef = doc(specificWorkoutColRef, specificWorkout.id);
        return setDoc(specificWorkoutDocRef, {
          id: specificWorkout.id,
          exerciseName: specificWorkout.exerciseName,
          exerciseImage: specificWorkout.exerciseImage,
          instruction1: specificWorkout.instruction1,
          instruction2: specificWorkout.instruction2,
          instruction3: specificWorkout.instruction3,

          reps: specificWorkout.reps,
          sets: specificWorkout.sets,
          type: specificWorkout.type,
          startingTime: specificWorkout.startingTime,
          intensity: specificWorkout.intensity
        });
      });

      return await Promise.all(specificWorkoutPromises);
    });

    try {
      await Promise.all(promises);
      console.log("All workout documents and specific workout documents successfully written!");
    } catch (error) {
      console.error("Error writing workout documents: ", error);
    }
  }

  // Get workout categories (arm, abs, etc)
  async getWorkoutsCategory(userId: string): Promise<Workouts[]> {
    try {
      const app = initializeApp(environment.firebaseConfig);
      const db = getFirestore(app);

      const userDocRef = doc(db, "users", userId);
      const workoutsColRef = collection(userDocRef, "workouts");

      const workoutDocs = await getDocs(workoutsColRef);
      const allWorkouts: Workouts[] = [];

      for (const workoutDoc of workoutDocs.docs) {
        console.log(`${workoutDoc.id} => `, workoutDoc.data());
        const workoutCategory = workoutDoc.data() as Workouts;
        allWorkouts.push(workoutCategory);
      }

      return allWorkouts;
    } catch (error) {
      console.error("Error getting documents: ", error);
      return [];
    }
  }

  async getSpecificWorkoutsByCategory(userId: string, categoryId: string): Promise<Workouts[]> {
    try {
      const app = initializeApp(environment.firebaseConfig);
      const db = getFirestore(app);

      const userDocRef = doc(db, "users", userId);
      const workoutsColRef = collection(userDocRef, "workouts");
      const categoryDocRef = doc(workoutsColRef, categoryId);

      // Get the specific workout subcollection within the category document
      const specificWorkoutsColRef = collection(categoryDocRef, "specificWorkouts");
      const specificWorkoutDocs = await getDocs(specificWorkoutsColRef);

      const specificWorkouts: Workouts[] = [];

      specificWorkoutDocs.forEach(specificWorkoutDoc => {
        const workout = specificWorkoutDoc.data() as Workouts;
        specificWorkouts.push(workout);
      });

      return specificWorkouts;
    } catch (error) {
      console.error("Error getting documents: ", error);
      return [];
    }
  }



  // async getWorkouts(): Promise<iWorkouts[]> {
  //   const app = initializeApp(environment.firebaseConfig);
  //   const db = getFirestore(app);

  //   const q = query(collection(db, "workouts"));
  //   const querySnapshot = await getDocs(q);

  //   const workouts: Workouts[] = []

  //   querySnapshot.forEach((doc) => {
  //     const workout = doc.data() as Workouts;
  //     workout.id = doc.id;
  //     workouts.push(workout);
  //   });
  //   return workouts;
  // }

  async back() {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          resolve("Success")
        }, this.time);
      } catch (error) {
        reject(error)
      }
    })
  }

  async presentAlert(headerTxt: string, messageTxt: string) {
    const alert = await this.alertController.create({
      header: headerTxt,
      message: messageTxt,
      buttons: ['Ok'],
    })
    await alert.present();
  }
}
