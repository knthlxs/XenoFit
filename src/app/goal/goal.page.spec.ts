import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoalPage } from './goal.page';

describe('GoalPage', () => {
  let component: GoalPage;
  let fixture: ComponentFixture<GoalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
