import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellPropsActionComponent } from './cell-props-action.component';

describe('CellPropsActionComponent', () => {
  let component: CellPropsActionComponent;
  let fixture: ComponentFixture<CellPropsActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CellPropsActionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CellPropsActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
