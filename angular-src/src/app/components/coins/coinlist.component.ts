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
import { serverUrl } from 'app/config/globals';
@Component({
  selector: 'app-dashboard',
  templateUrl: './coinlist.component.html',
  styleUrls: ['./coin.component.css']
})
export class CoinListComponent implements OnInit {

  displayedColumns = [
    '#', 'name', 'market_cap',
    'price','volume24h','supplies','change1h',
    'change24h','change7d','change1M','change6M'];
  exampleDatabase: ExampleHttpDao | null;
  dataSource = new MatTableDataSource();

  resultsLength = 0;
  isLoadingResults = false;
  isRateLimitReached = false;
  ticks = 0;
  private timer;
  private sub: Subscription;
  selectedprice: string;
  selectedmarket : string;
  selectedvolumn : string;
  selectedcirculate : string;
  selectedage : string;
  currentTime : number;
  sendage : string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private coinService: CoinService,
    private router: Router
  ) {}

  ngOnInit() {
    this.exampleDatabase = new ExampleHttpDao(this.http);
    this.selectedprice = "_";
    this.selectedmarket = "_";
    this.selectedvolumn = "_";
    this.selectedcirculate = "_";
    this.selectedage = "_";
    this.currentTime = Date.now();
    this.sendage = this.selectedage;
    
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.timer = Observable.timer(2000,5000);
    
    this.sub = this.timer.subscribe(t => this.tickerFunc(t));
    console.log(this.currentTime);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;

          var aStr = this.selectedage.split("_");
          if(aStr[0] != "")
          {
            this.sendage = (this.currentTime - parseInt(aStr[0])) + "_";
            console.log(this.sendage);
          
          }
          else if(aStr[1] != "")
          {

            this.sendage = "_" + (this.currentTime - parseInt(aStr[1]));
            //console.log(this.sendage);
           
          }
          else{
            this.sendage = "_";
          }
            return this.exampleDatabase!.getRepoIssues(
            this.sort.active, this.sort.direction, this.paginator.pageIndex, this.selectedprice, this.selectedmarket, this.selectedvolumn, this.selectedcirculate, this.sendage);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.total_count;
          return data.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      ).subscribe(data => 
        {
          this.dataSource.data = data
        }
        
      );
  }

  tickerFunc(tick){
      console.log(this);
      this.ticks = tick;
      this.paginator._changePageSize(this.paginator.pageSize); 
  }

  onChange(event)
  {
    this.paginator.pageIndex = 0;
  }
}

export interface CoinTickersAPI {
  items: CoinTicker[];
  total_count: number;
}

export interface CoinTicker {
  'coinName': string;
  'name': string;
  'symbol': string;
  'rank' : number;
  'usd': number;
  'btc': number;
  'vlm': number;
  'cap' : number;
  'since_ts': number;
  'p_1h' : number;
  'p_24h' : number;
  'p_7d' : number;
  'token' : number;
  '52w_l' : number;
  '52w_h' : number;
  'p_1M' : number;
  'p_6M' : number;
}

/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDao {
  constructor(private http: HttpClient ) {}

  getRepoIssues(sort: string, order: string, page: number, priceFilter: string, marketFilter: string, volumnFilter: string, circulFilter : string, ageFilter : string): Observable<CoinTickersAPI> {

    // const href = 'https://api.github.com/search/issues';
    // const requestUrl =
    //     `${href}?q=repo:angular/material2&sort=${sort}&order=${order}&page=${page + 1}`;

    // return this.http.get<GithubApi>(requestUrl);

    
    let token =  localStorage.getItem('id_token');
    //send token with header
    const headers = new HttpHeaders().set('Authorization', token);
    const href = serverUrl + 'coins/getAllTickers';
    const requestUrl = `${href}?sort=${sort}&order=${order}&page=${page + 1}&pFilter=${priceFilter}&mFilter=${marketFilter}&vFilter=${volumnFilter}&cFilter=${circulFilter}&aFilter=${ageFilter}`;
    //return this.http.get<CoinTickersAPI>(requestUrl,{ headers }); It does not allowed unauthorize token
    return this.http.get<CoinTickersAPI>(requestUrl);
  }
}

