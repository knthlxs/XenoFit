import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }
  canActivate() {
    if (localStorage.getItem('isLogin') === 'true') {
      return true;
    } else {
      this.router.navigate(['signin'])
      return false
    }
  }
}
