import { AuthService } from '../../services/auth.service';
import { CoinService } from '../../services/coin.service';
import { Router } from '@angular/router';
import {Http, Headers} from "@angular/http";

import {Component, OnInit,AfterViewInit, ViewChild, OnDestroy} from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http';
import {MatPaginator, MatSort, MatTableDataSource, MatTabChangeEvent } from '@angular/material';

import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {catchError} from 'rxjs/operators/catchError';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {switchMap} from 'rxjs/operators/switchMap';
import {MatListModule} from '@angular/material/list';
//import { HttpHeaders } from '@angular/common/http/src/headers';
import { Observable, Subscription } from 'rxjs/Rx';
import { serverUrl } from 'app/config/globals';
import { Paginator } from 'angular2-datatable/lib/Paginator';
@Component({
  selector: 'app-dashboard',
  templateUrl: './highsLows.component.html',
  styleUrls: ['./highsLows.component.css']
})
export class highsLowsComponent implements OnInit {

  displayedColumns = [
     'name','symbol','last','change','changeP','volume'];
  exampleDatabase: ExampleHttpDao | null;
  exampleDatabase_Low : ExampleHttpDao_Low | null;

  dataSource = new MatTableDataSource();
  dataSource1 = new MatTableDataSource();

  resultsLength = 0;
  resultsLength1 = 0;
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
  selectedtype : string;
  selectedPerfomance : string;
  selectedOrder : string;
  currentTime : number;
  sendage : string;
  selectedHighs : string;
  selectedLows : string;
  typesOfShoes = [];
  isHighs : boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('hBSort') hBSort: MatSort;
  @ViewChild('hBpaginator') hBpaginator: MatPaginator;

  @ViewChild('lBSort') lBSort: MatSort;
  @ViewChild('lBpaginator') lBpaginator: MatPaginator;


  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private coinService: CoinService,
    private router: Router
  ) {}

  ngOnInit() {
    this.selectedHighs = '1';
    this.selectedLows = '1';
    this.hBSort = this.sort;
    this.lBSort = this.sort;
    this.isHighs = true;
    
    this.exampleDatabase = new ExampleHttpDao(this.http);
    this.exampleDatabase_Low = new ExampleHttpDao_Low(this.http);

    // If the user changes the sort order, reset back to the first page.
    this.hBSort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0,this.paginator.pageSize = 100
    });
    this.timer = Observable.timer(10000,20000);
    
    this.sub = this.timer.subscribe(t => this.tickerFunc(t));
    merge(this.hBSort.sortChange, this.hBpaginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
            this.isLoadingResults = true;

            let pageSize = (!this.hBpaginator.pageSize)? 100 : this.hBpaginator.pageSize;
            return this.exampleDatabase!.getRepoIssues(this.hBSort.active, this.hBSort.direction, this.hBpaginator.pageIndex,pageSize, this.selectedHighs);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.resultsLength = data.total_count;
          //this.hBpaginator.length = data.total_count;
          let items = [];
          data.items.forEach(function(item){
            let tItem = {};
            tItem['coinName'] = item['coinName'].toString();
            tItem['symbol'] = item['symbol'].toString();
            tItem['price'] = parseFloat(item['price']);
            tItem['pclose'] = parseFloat(item['pclose']);
            var change = tItem['price'] - tItem['pclose'];
            var str = change.toExponential(2).toString().split("e+")[1];
            //console.log(str);
            tItem['change'] =  change!=0? str != "0"? change.toExponential(2):change.toFixed(2) : 0;
            //tItem['change'] = change < 0 ? "-" + tItem['change'] : "+" + tItem['change'];
            tItem['changeP'] = change!= 0? ((change / tItem['pclose']) * 100).toFixed(3) : 0;
            tItem['volume'] = item['volume'].toString();
            items.push(tItem);
          });
          return items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          return observableOf([]);
        })
      ).subscribe(data => 
        {
          this.dataSource.data = data;
        }
        
      );
      merge(this.lBSort.sortChange, this.lBpaginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
            this.isLoadingResults = true;

            let pageSize = (!this.lBpaginator.pageSize)? 100 : this.lBpaginator.pageSize;
            return this.exampleDatabase_Low!.getRepoIssues_lows(this.lBSort.active, this.lBSort.direction, this.lBpaginator.pageIndex,pageSize, this.selectedLows);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          //this.lBpaginator.length = data.total_count;
          this.resultsLength1 = data.total_count;

          let items = [];
          data.items.forEach(function(item){
            let tItem = {};
            tItem['coinName'] = item['coinName'].toString();
            tItem['symbol'] = item['symbol'].toString();
            tItem['price'] = parseFloat(item['price']);
            tItem['pclose'] = parseFloat(item['pclose']);
            var change = tItem['price'] - tItem['pclose'];
            var str = change.toExponential(2).toString().split("e+")[1];
            //console.log(str);
            tItem['change'] =  change!=0? str != "0"? change.toExponential(2):change.toFixed(2) : 0;
            //tItem['change'] = change < 0 ? "-" + tItem['change'] : "+" + tItem['change'];
            tItem['changeP'] = change!= 0 ? ((change / tItem['pclose']) * 100).toFixed(3) : 0;
            tItem['volume'] = item['volume'].toString();
            items.push(tItem);
          });
          return items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          return observableOf([]);
        })
      ).subscribe(data => 
        {
          this.dataSource1.data = data;
        }
        
      );
  }
  ngOnDestroy(){
    this.sub.unsubscribe();
  }
  tickerFunc(tick){
      console.log(this);
      this.ticks = tick;
      this.hBpaginator._changePageSize(this.hBpaginator.pageSize);
      this.lBpaginator._changePageSize(this.lBpaginator.pageSize);
  }

  onChange(event)
  {
    this.hBpaginator.pageIndex = 0;
    this.hBpaginator._changePageSize(this.hBpaginator.pageSize); 
  }

  onChange_Low(event)
  {
    this.lBpaginator.pageIndex = 0;
    this.lBpaginator._changePageSize(this.lBpaginator.pageSize); 
  }
  public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
      console.log(tabChangeEvent);
      if(tabChangeEvent.index == 0) this.isHighs = true;
      else this.isHighs = false;
  }
}
const numberWithCommas = (x) => {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
export interface CoinTickersAPI {
  items: CoinTicker[];
  total_count: number;
}

export interface CoinTicker {
  'coinName': string,
  'price': string
}

/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDao {
  constructor(private http: HttpClient ) {}

  getRepoIssues(sort: string, order: string, page: number, pagecount: number, selectedHighs : string): Observable<CoinTickersAPI> {
    
    let token =  localStorage.getItem('id_token');
    //send token with header
    const headers = new HttpHeaders().set('Authorization', token);
    const href = serverUrl + 'coins/getHighs';
    const requestUrl = `${href}?page=${page + 1}&pageCount=${pagecount}&selectedHighs=${selectedHighs}`;
    //return this.http.get<CoinTickersAPI>(requestUrl,{ headers }); It does not allowed unauthorize token
    return this.http.get<CoinTickersAPI>(requestUrl);
  }
}

export class ExampleHttpDao_Low {
  constructor(private http: HttpClient ) {}

  getRepoIssues_lows(sort: string, order: string, page: number, pagecount: number, selectedLows : string): Observable<CoinTickersAPI> {
    
    let token =  localStorage.getItem('id_token');
    //send token with header
    const headers = new HttpHeaders().set('Authorization', token);
    const href = serverUrl + 'coins/getLows';
    const requestUrl = `${href}?page=${page + 1}&pageCount=${pagecount}&selectedLows=${selectedLows}`;
    //return this.http.get<CoinTickersAPI>(requestUrl,{ headers }); It does not allowed unauthorize token
    return this.http.get<CoinTickersAPI>(requestUrl);
  }
}
