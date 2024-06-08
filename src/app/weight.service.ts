import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WeightService {

  constructor() { }

  getUserWeights() {
    
    return this.auth.authState.pipe(
      map(user => {
        if (user) {
          return this.firestore.collection(`users/${user.uid}/weights`).valueChanges();
        } else {
          return [];
        }
      })
    );
  }
}
