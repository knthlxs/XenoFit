import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MePage } from './me.page';

describe('MePage', () => {
  let component: MePage;
  let fixture: ComponentFixture<MePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
