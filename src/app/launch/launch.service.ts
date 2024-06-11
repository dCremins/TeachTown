import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { LogLevel, QueryResults } from './types';
import { SortDirection } from '@angular/material/sort';

@Injectable({
  providedIn: 'root',
})
export class LaunchService {
  constructor(private http: HttpClient) {}

  private spaceXApi = 'https://api.spacexdata.com/v5/launches/query';

  /**
   * Handles logging for the service.
   * Uses console to mock a logging system
   * @param message String message to output to the logs
   * @param level Level of logging to output. Useful for filtering logs
   */
  private log(message: string, level: LogLevel) {
    switch (level) {
      case LogLevel.Error:
        console.error(message);
        break;
      case LogLevel.Warning:
        console.warn(message);
        break;
      default:
        console.info(message);
        break;
    }
  }

  /**
   * Logs errors and returns an observable, so the app can continue running
   * @param operation What operation failed, for debugging
   * @param result Optional return value
   * @returns Observable of the result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${error.error.message}`, LogLevel.Error);
      return of(result as T);
    };
  }

  /**
   * Gets paginated list of SpaceX launches
   * @param sort field to sort by
   * @param order direction to sort by
   * @param page page of results to display
   * @returns QueryResuts where doc is an array of launches
   *
   * See https://github.com/r-spacex/SpaceX-API/blob/master/docs/queries.md for more
   * options and info
   */
  public getLaunches(
    sort: string,
    order: SortDirection,
    page: number
  ): Observable<QueryResults | null> {
    const body = {
      query: {},
      options: {
        sort: { [sort]: order },
        page: page + 1,
        limit: 10,
      },
    };
    return this.http.post<QueryResults | null>(this.spaceXApi, body).pipe(
      tap((_) =>
        this.log(`Fetched page ${page + 1} of launches`, LogLevel.Info)
      ),
      catchError(this.handleError<QueryResults | null>('getLaunches', null))
    );
  }
}
