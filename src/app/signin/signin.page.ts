import { Component, OnInit } from '@angular/core';
import { SignInService } from '../signin.service';
import { Router } from '@angular/router';
import { SignupService } from '../signup.service';
import { Workouts } from '../models/workout.model';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {
  email: string = this.signInService.email;
  password: string = this.signInService.password;
  workouts: Workouts[] = []

  constructor(private signInService: SignInService, private router: Router, private signupService: SignupService) { }

  async ngOnInit() {


  }



  signin() {
    this.signInService.login(this.email, this.password).then(username => {
      this.signupService.presentAlert(`Welcome, ${username}`, "Successfully logged in!")
    }).catch(error => {
      this.signupService.presentToast("Incorrect credentials, please try again");
    });
  }

  signup() {
    this.signInService.signup().then(success => {
      if (success === "Success") {
        this.router.navigate(['signup'])
      }
    }).catch(error => {
      this.signupService.presentToast("An error has occured")
    })
  }

  // ionViewWillEnter() {
  //   if (localStorage.getItem('isLogin') === "true") {
  //     this.router.navigate(['dashboard/home'])
  //   }
  // }
}
