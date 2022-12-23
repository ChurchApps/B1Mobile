import { ApiConfig, RolePermissionInterface, ApiListType } from "./Interfaces";

export class ApiHelper {

  static apiConfigs: ApiConfig[] = [];
  static isAuthenticated = false;


  static getConfig(keyName: string) {
    let result: ApiConfig | undefined;
    this.apiConfigs.forEach(config => { if (config.keyName === keyName) result = config });
    //if (result === null) throw new Error("Unconfigured API: " + keyName);
    return result;
  }

  static setDefaultPermissions(jwt: string) {
    this.apiConfigs.forEach(config => {
      config.jwt = jwt;
      config.permisssions = [];
    });
    this.isAuthenticated = true;
  }

  static setPermissions(keyName: string, jwt: string, permissions: RolePermissionInterface[]) {
    this.apiConfigs.forEach(config => {
      if (config.keyName === keyName) {
        config.jwt = jwt;
        config.permisssions = permissions;
      }
    });
    this.isAuthenticated = true;
  }

  static clearPermissions() {
    this.apiConfigs.forEach(config => { config.jwt = ""; config.permisssions = []; });
    this.isAuthenticated = false;
  }

  static async get(path: string, apiName: ApiListType) {
    const config = this.getConfig(apiName);
    if (config === undefined) return;
    try {
      const requestOptions = { method: 'GET', headers: { 'Authorization': 'Bearer ' + config.jwt } };
      return fetch(config.url + path, requestOptions).then(response => response.json())
    } catch (e) {
      throw (e);
    }
  }

  static async getAnonymous(path: string, apiName: ApiListType) {
    const config = this.getConfig(apiName);
    if (!config) return
    try {
      const requestOptions = { method: "GET" };
      return fetch(config.url + path, requestOptions).then(response => response.json())
    } catch (e) {
      throw (e);
    }
  }

  static async post(path: string, data: any[] | {}, apiName: ApiListType) {
    const config = this.getConfig(apiName);
    if (config === undefined) return;
    const requestOptions = {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + config.jwt, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
    console.log(config.url + path)
    console.log(JSON.stringify(requestOptions))
    return fetch(config.url + path, requestOptions).then(response => response.json()).catch(_ => null);
  }

  static async delete(path: string, apiName: ApiListType) {
    const config = this.getConfig(apiName);
    if (config === undefined) return;
    const requestOptions = {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + config.jwt }
    };
    return fetch(config.url + path, requestOptions);
  }

  static async postAnonymous(path: string, data: any[] | {}, apiName: ApiListType) {
    const config = this.getConfig(apiName);
    if (config === undefined) return;
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
    return fetch(config.url + path, requestOptions).then(response => response.json())
  }

}
