import { AuthService } from '../../services/auth.service';
import { CoinService } from '../../services/coin.service';
import { Router } from '@angular/router';
import {Http, Headers} from "@angular/http";
import { Injectable } from '@angular/core'

import {Component, OnInit,AfterViewInit, ViewChild} from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

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
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';

@Component({
  selector: 'app-dashboard',
  templateUrl: './highsLows.component.html',
  styleUrls: ['./highsLows.component.css']
})

export class highsLowsComponent implements OnInit {

  selectedHighs : string;
  selectedLows : string;
  result : string;
  private timer;
  private sub: Subscription;


  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private coinService: CoinService,
    private router: Router,
    
  ) {}

  ngOnInit() {
    this.selectedHighs = '1M';
    this.selectedLows = '1M';
    this.timer = Observable.timer(10000, 20000);
        

    let token =  localStorage.getItem('id_token');
    //send token with header
    const headers = new HttpHeaders().set('Authorization', token);
    const href = serverUrl + 'coins/highsLows';
    const requestUrl = `${href}?highs=${this.selectedHighs}&lows=${this.selectedLows}`;
    //return this.http.get<CoinTickersAPI>(requestUrl,{ headers }); It does not allowed unauthorize token
    this.sub = this.timer.subscribe(res => this.tickerFunc(requestUrl));
  }
 
  tickerFunc(tick){
    console.log(this);
    return this.http.get(tick).subscribe(res => { console.log(res['result']);});
  }
   
  
}

