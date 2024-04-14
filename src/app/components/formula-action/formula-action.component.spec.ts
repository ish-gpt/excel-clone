import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulaActionComponent } from './formula-action.component';

describe('FormulaActionComponent', () => {
  let component: FormulaActionComponent;
  let fixture: ComponentFixture<FormulaActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormulaActionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulaActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
