import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SignInService } from '../signin.service';
import { SignupService } from '../signup.service';

@Component({
  selector: 'app-me',
  templateUrl: './me.page.html',
  styleUrls: ['./me.page.scss'],
})
export class MePage implements OnInit {
  userId: any
  userWeight: number;
  userHeight: number;
  userName: string;
  userAge: string;
  userGender: string;

  userBMI: number
  userBMIClassification: string
  changesMade: boolean = false;
  isLoading: boolean = false

  constructor(private router: Router, private signUpServ: SignupService) { }

  ngOnInit() {
    this.isLoading = true;
    this.userId = localStorage.getItem('userId')?.toString();
    this.loadUserInfo();
    this.isLoading = false;
  }

  refreshProfile(event: any) {
    setTimeout(async () => {
    await this.loadUserInfo();
      event.target.complete();
    }, 2000);
  }

  async loadUserInfo() {
    try {
      const userInfo = await this.signUpServ.getUser(this.userId);
      console.log(userInfo); // Log the user info to ensure it's fetched correctly
      this.userWeight = userInfo['weight'];
      this.userHeight = userInfo['height'];
      this.userName = userInfo['name'];
      this.userAge = userInfo['age'];
      this.userGender = userInfo['gender']
      this.userBMI = userInfo['bmi'].toFixed(2)
      this.userBMIClassification = userInfo['classification'];
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }

  checkChanges() {
    this.changesMade = true;
  }

  save() {
    this.isLoading = true;
    this.changesMade = false;
    if (this.userName !== '' && this.userAge !== null && this.userGender !== '' && this.userWeight !==null && this.userHeight !== null) {
      this.signUpServ.updateUser(this.userId, this.userName, this.userWeight, this.userHeight)
      this.loadUserInfo();
    } else {
      this.signUpServ.presentToast('')
    }

    this.isLoading = false;
  }

  back() {
    this.router.navigate(['dashboard/workout'])
  }

  logout() {
    localStorage.removeItem('isLogin');
    localStorage.removeItem('user');
    localStorage.removeItem('userId')
    this.router.navigate(['signin'])
  }
}
