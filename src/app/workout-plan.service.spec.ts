import { TestBed } from '@angular/core/testing';

import { WorkoutPlanService } from './workout-plan.service';

describe('WorkoutPlanService', () => {
  let service: WorkoutPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkoutPlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
