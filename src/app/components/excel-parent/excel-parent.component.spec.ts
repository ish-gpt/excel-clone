import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelParentComponent } from './excel-parent.component';

describe('ExcelParentComponent', () => {
  let component: ExcelParentComponent;
  let fixture: ComponentFixture<ExcelParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExcelParentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcelParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
