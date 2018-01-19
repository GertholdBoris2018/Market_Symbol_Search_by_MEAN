import { AuthService } from '../../services/auth.service';
import { CoinService } from '../../services/coin.service';
import { Router } from '@angular/router';
import {Http, Headers} from "@angular/http";

import {Component, OnInit,AfterViewInit, ViewChild} from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {catchError} from 'rxjs/operators/catchError';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {switchMap} from 'rxjs/operators/switchMap';
//import { HttpHeaders } from '@angular/common/http/src/headers';
import { Observable, Subscription } from 'rxjs/Rx';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // displayedColumns = ['#', 'name', 'market_cap', 'price','volumn24h','supplies','change1h','change24h','change7d'];
  // exampleDatabase: ExampleHttpDao | null;
  // dataSource = new MatTableDataSource();

  // resultsLength = 0;
  // isLoadingResults = false;
  // isRateLimitReached = false;
  // ticks = 0;
  // private timer;
  // private sub: Subscription;
  
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;

  constructor(
    // private http: HttpClient,
    // private authService: AuthService,
    // private coinService: CoinService,
    // private router: Router
  ) {}

  ngOnInit() {
    
  }

}

