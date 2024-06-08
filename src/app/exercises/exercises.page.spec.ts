import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExercisesPage } from './exercises.page';

describe('ExercisesPage', () => {
  let component: ExercisesPage;
  let fixture: ComponentFixture<ExercisesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ExercisesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
