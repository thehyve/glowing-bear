export class Modifier {
    private _name: string;
    private _path: string;
    private _elements: string[];

    constructor(name: string) {
        this._name = name;
        this._elements = [];
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get path(): string {
        return this._path;
    }

    public set path(value: string) {
        this._path = value;
    }

    public get elements(): string[] {
        return this._elements;
    }
    public set elements(value: string[]) {
        this._elements = value;
    }
}