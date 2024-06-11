import { TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { LaunchService } from './launch.service';
import {
  HttpClient,
  HttpHandler,
  provideHttpClient,
} from '@angular/common/http';
import { LogLevel } from './types';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

describe('LaunchService', () => {
  let service: LaunchService;
  let mockHttp: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LaunchService);
    mockHttp = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that none of the tests make any extra HTTP requests.
    mockHttp.verify();
  });

  describe('getLaunches', () => {
    it('should call the spaceX api with the provided query', fakeAsync(() => {
      service.getLaunches('launch_number', 'asc', 1).subscribe();
      const req = mockHttp.expectOne(
        'https://api.spacexdata.com/v5/launches/query'
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        query: {},
        options: {
          sort: { ['launch_number']: 'asc' },
          page: 2,
          limit: 10,
        },
      });
    }));

    it('should log success', fakeAsync(() => {
      const spy = spyOn<any>(service, 'log');
      service.getLaunches('launch_number', 'asc', 1).subscribe(() => {
        expect(spy).toHaveBeenCalledWith(
          'Fetched page 2 of launches',
          LogLevel.Info
        );
      });
      // Close the http call
      const req = mockHttp.expectOne(
        'https://api.spacexdata.com/v5/launches/query'
      );
      req.flush(null);
    }));

    it('should log errors and return empty observable', fakeAsync(() => {
      const spyLog = spyOn<any>(service, 'log');
      const spyError = spyOn<any>(service, 'handleError').and.callThrough();
      service.getLaunches('launch_number', 'asc', 1).subscribe((launches) => {
        expect(spyError).toHaveBeenCalledWith('getLaunches', null);
        expect(spyLog).toHaveBeenCalledWith(
          'getLaunches failed: Failed!',
          LogLevel.Error
        );
        expect(launches).toBeNull();
      });
      // Fail the http call
      const req = mockHttp.expectOne(
        'https://api.spacexdata.com/v5/launches/query'
      );
      req.flush(
        { message: 'Failed!' },
        {
          status: 400,
          statusText: '',
        }
      );
      flush();
    }));
  });
});
