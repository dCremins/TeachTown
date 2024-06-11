import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TableComponent } from './table.component';
import { LaunchService } from '../launch/launch.service';
import { of } from 'rxjs';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  let mockLaunchService: jasmine.SpyObj<LaunchService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableComponent],
      providers: [
        {
          provide: LaunchService,
          useValue: jasmine.createSpyObj('LaunchService', ['getLaunches']),
        },
      ],
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        MatSortModule,
        MatTooltipModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    mockLaunchService = TestBed.inject(
      LaunchService
    ) as jasmine.SpyObj<LaunchService>;
  });

  describe('ngAfterViewInit', () => {
    it('should initialize launches', fakeAsync(() => {
      const spy = spyOn(component, 'getLaunches');
      component.ngAfterViewInit();
      expect(spy).toHaveBeenCalled();
    }));
  });

  describe('getLaunches', () => {
    it('should call the spaceX api and set the table data', () => {
      mockLaunchService.getLaunches.and.returnValue(
        of({ docs: [{ id: 'thing' }], totalDocs: 1 } as any)
      );
      component.getLaunches();
      expect(mockLaunchService.getLaunches).toHaveBeenCalled();
      expect(component.resultsLength).toBe(1);
    });
  });

  describe('openPressKit', () => {
    it('should open the press kit if there is one', () => {
      const spy = spyOn(window, 'open');
      component.openPressKit({ links: { presskit: 'someLink' } } as any);
      expect(spy).toHaveBeenCalledWith('someLink', '_blank');
    });

    it('should do nothing if there is no presskit link', () => {
      const spy = spyOn(window, 'open');
      component.openPressKit({ links: { presskit: null } } as any);
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
