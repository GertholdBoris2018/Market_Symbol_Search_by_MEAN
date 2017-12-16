/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CoinService } from './coin.service';

describe('CoinService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoinService]
    });
  });

  it('should ...', inject([CoinService], (service: CoinService) => {
    expect(service).toBeTruthy();
  }));
});
