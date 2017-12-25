import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class AuthService {
	authToken: any;
	user: any;

	constructor(private http:Http) { }

	//send new user info from form to database as json to be registered
	registerUser(user){
		let headers = new Headers();
		headers.append('Content-Type','application/json');
		return this.http.post('http://204.12.62.182:4000/users/register', user,{headers: headers})
			.map(res => res.json());
	}

	//send user info to server as json to be authenticated
	authenticateUser(user){
		let headers = new Headers();
		headers.append('Content-Type','application/json');
		return this.http.post('http://204.12.62.182:4000/users/authenticate', user,{headers: headers})
			.map(res => res.json());
	}

	//load token, add authorization to token, get profile
	getProfile(){
		let headers = new Headers();

		//load token so we have access to this.authToken
		this.loadToken();
		//send token with header
		headers.append('Authorization', this.authToken);

		headers.append('Content-Type','application/json');
		return this.http.get('http://204.12.62.182:4000/users/profile', {headers: headers})
			.map(res => res.json());
	}
	
	//store user data in local storage
	storeUserData(token, user){
		localStorage.setItem('id_token', token);
		localStorage.setItem('user', JSON.stringify(user));
		this.authToken = token;
		this.user = user;
	}

	//fetch token from local storage
	loadToken(){
		const token = localStorage.getItem('id_token');
		this.authToken = token;
	}

	//is user logged in?
	loggedIn(){
		return tokenNotExpired('id_token');
	}

	//clear local storage and set local variables to null
	logout(){
		this.authToken = null;
		this.user = null;
		localStorage.clear();
	}
}
