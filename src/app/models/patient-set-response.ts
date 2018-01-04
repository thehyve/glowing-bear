import { Constraint } from './constraints/constraint';

export class PatientSetResponse {

    private _description: string;
    private _errorMessage: string;
    private _id: number;
    private _setSize: number;
    private _status: string;
    private _username: string;
    private _requestConstraints: Constraint;
    private _apiVersion: string;

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get errorMessage(): string {
        return this._errorMessage;
    }

    set errorMessage(value: string) {
        this._errorMessage = value;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get setSize(): number {
        return this._setSize;
    }

    set setSize(value: number) {
        this._setSize = value;
    }

    get status(): string {
        return this._status;
    }

    set status(value: string) {
        this._status = value;
    }

    get username(): string {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get requestConstraints(): Constraint {
        return this._requestConstraints;
    }

    set requestConstraints(value: Constraint) {
        this._requestConstraints = value;
    }

    get apiVersion(): string {
        return this._apiVersion;
    }

    set apiVersion(value: string) {
        this._apiVersion = value;
    }

}
