'use strict';
import { URLSearchParams, URL } from "url";
// import axios /* , { AxiosRequestConfig } */ from "axios";
const axios = require('axios');
require('syswide-cas').addCAs('luminus.pem');
const tough = require('tough-cookie');
require('axios-cookiejar-support').default(axios);
// This does not amend the type definitions, issues later, for now AxiosRequestConfig is not imported

class LumiNUS {
	protected readonly vafs_client_id = "E10493A3B1024F14BDC7D0D8B9F649E9-234390";
	protected access_token: string | undefined = undefined;
	protected client = axios.create({
		baseURL: "https://luminus.azure-api.net", // does not affect absolute urls
		withCredentials: true,
  		jar: new tough.CookieJar(),
		headers: {
			"Ocp-Apim-Subscription-Key": "6963c200ca9440de8fa1eede730d8f7e"
		}
	});
	constructor() {
		this.client.interceptors.request.use((config: any /* | AxiosRequestConfig */ ) => { // TODO
			config.headers.Authorization = this.access_token ? `Bearer ${this.access_token}` : "";
			return config;
		});
	}
	async login(username: string, password: string) {
		// should return the bearer token
		let resp = await this.client.post(
			"https://vafs.nus.edu.sg/adfs/oauth2/authorize",
			{
				UserName: username,
				Password: password,
				AuthMethod: "FormsAuthentication"
			},
			{
			params: {
				response_type: "code",
				client_id: "E10493A3B1024F14BDC7D0D8B9F649E9-234390",
				redirect_uri: "https://luminus.nus.edu.sg/auth/callback",
				resource: "sg_edu_nus_oauth"
			},
			validateStatus: (status: number) => status == 302,
			maxRedirects: 0,
			transformRequest: [(data: any, headers: any) => new URLSearchParams(data).toString()]
			}
		);
		resp = await this.client.get(
			resp.headers.location,
			{
			validateStatus: (status: number) => status == 302,
			maxRedirects: 0
			}
		);
		resp = await this.client.post(
			"https://luminus.nus.edu.sg/v2/api/login/adfstoken",
			new URLSearchParams({
				grant_type: "authorization_code",
				client_id: this.vafs_client_id,
				resource: "sg_edu_nus_oauth",
				redirect_uri: "https://luminus.nus.edu.sg/auth/callback",
				code: new URL(resp.headers.location).searchParams.get("code") || ""
			}).toString(),
			{
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				}
			}
		);
		this.access_token = resp.data.access_token;
		console.log(this.access_token);
	}
	pathToUuid(path: string): string {
		// TODO UUID can be typed
		// FIXME dummy return for now, aync tba
		return "be86cc64-736d-43eb-acd9-0e629752c8e3";
	}
	getChildrenByUuid(uuid: string): object {
		return {
			data: [
				{ name: "foo" },
				{ name: "bar" }
			]
		};
	}
}

export default LumiNUS;
