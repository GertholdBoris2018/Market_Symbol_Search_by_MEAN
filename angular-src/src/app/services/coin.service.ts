import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import { serverUrl } from 'app/config/globals';
@Injectable()
export class CoinService {

  constructor(private http:Http) { }
    //get coins
	getAllCoinTickers(){
		let headers = new Headers();

		//load token so we have access to this.authToken
		let token =  localStorage.getItem('id_token');
		//send token with header
		headers.append('Authorization', token);

		headers.append('Content-Type','application/json');
		return this.http.get(serverUrl + 'coins/getAllTickers', {headers: headers})
		.map(res => res.json());
	}

}
