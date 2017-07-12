import EventEmitter from 'events';

declare module "lib" {

    export interface Parser {
        parse(metadata:Metadata):Promise<object>;
    }

    export class Metadata {
        dir:string;
        file:string;
        data:object;
        search:object;

        construtor(dir:string, file:string);

        read():Promise<Metadata>;

        has(key:string):boolean;
        
        set(key:string, value:any):void;
        
        add(key:string, value:Array<any>):void;
        
        get(key:string):any;
        
        getFilePath():string;
        
        check():void;
    }

    export class Indexer {
        _index:string;
        _mapping:object;
        _client:object;

        constructor(config:object);

        createIndex():void

        index(metadata:Metadata):Promise<Metadata>;
        update(metadata:Metadata):Promise<Metadata>;
        exists(metadata:Metadata):Promise<string>;
    }

    export class Watcher extends EventEmitter {
        dir:string;
        watching:boolean;

        constructor(dir:string);

        watch():Watcher;

        read():Watcher;

        stop():Watcher;
    }

    //declare class NumberParser implements Parser {}

}

interface Promise<T> {
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    finally<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
}