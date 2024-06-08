import { Injectable } from '@angular/core';
import { signInWithEmailAndPassword, getAuth, onAuthStateChanged } from 'firebase/auth';
import { Router } from '@angular/router';
import { SignupService } from './signup.service';
import { Workouts } from './models/workout.model';

@Injectable({
  providedIn: 'root'
})
export class SignInService {
  email: string = "";
  password: string = "";
  username: string = "";
  time: number = 1000;
  currentUserId: any;
  userId: any;

  constructor(private router: Router, private signupServ: SignupService) { }

  // getUser() {
  //   return new Promise((resolve, reject) => {
  //     const auth = getAuth();

  //     onAuthStateChanged(auth, (user) => {
  //       if (user) {
  //         this.currentUserId = user.photoURL;
  //         resolve(`${this.currentUserId}`)
  //       } else {
  //         reject(`Not signed in`)
  //       }
  //     })
  //   })
  // }

  async login(email: string, password: string) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {

        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password).then(userCredential => {
          const user = userCredential.user;

          // Fetch workouts for the logged-in user
          this.userId = user.uid
          localStorage.setItem('userId', `${this.userId}`) // Store the user id to be used in showin workout collection in workout page.ts
          console.log(user.uid);

          const welcomeUser = user.email?.substring(0, user.email.indexOf("@"));
          localStorage.setItem('isLogin', "true")
          localStorage.setItem('user', `${welcomeUser}`)
          this.username = `${welcomeUser}`;
          // this.router.navigate(['dashboard/workout']);
          window.location.href = 'dashboard/workout'
          resolve(this.username);
        }).catch(error => {
          reject(error)
        });
      }, this.time);
    })
  }

  async signup() {
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
}
