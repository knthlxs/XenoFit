import { Component, OnInit } from '@angular/core';
import { SignupService } from '../signup.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  constructor(private signupService: SignupService, private router: Router) {
  }
  isSignUpModalOpenBool = false;
  showSignupBackBtn = false;
  email: string = this.signupService.email;
  password: string = this.signupService.password;
  reEnterPassword: string = this.signupService.reEnterPassword;
name: string;
weight: number;
height: number;
age: number;
gender:string;


  ngOnInit() {
  }

  isSignUpModalOpen(isOpen: boolean) {

  }

  next() {
    if (this.name && this.age && this.weight && this.height && this.gender) {
    this.isSignUpModalOpenBool = true;
      
    } else {
      this.signupService.presentToast('Please input all required fields.')
    }
  }

  signup() {
    this.signupService.signup(this.email, this.password, this.reEnterPassword, this.name, this.weight, this.height,this.age, this.gender).then(success => {
      if (success === "Success") {
        this.signupService.presentToast("Signed up successfully!");
        this.router.navigate(['signin'])
      }
      console.log(success);
    }).catch(error => {
      if (error === "Incomplete fields") {
        this.signupService.presentToast("Please fill all required fields.");
      } else if (error === "Incorrect credentials") {
        this.signupService.presentToast("Password didn't match.");
      } else if (error === "Invalid password") {
        this.signupService.presentAlert("Failed", "Password should be at least 6 characters, please use a strong password")
      } else if (error === "Invalid email") {
        this.signupService.presentAlert("Failed", "Email is already taken, please use other email")
      }
    });
  }

  back() {
    // this.signupService.back().then(success => {
    //   if (success === "Success") {
    //     this.router.navigate(['signin'])
    //   }
    // }).catch(error => {
    //   this.signupService.presentToast("An error has occured.")
    // })
    this.isSignUpModalOpenBool = false
  }

backToLogin() {
  this.router.navigate(['signin'])
}
} 
