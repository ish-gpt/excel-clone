import { TestBed } from '@angular/core/testing';

import { GridStyleHelperService } from './grid-style-helper.service';

describe('GridStyleHelperService', () => {
  let service: GridStyleHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GridStyleHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
