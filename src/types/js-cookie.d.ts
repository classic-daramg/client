declare module 'js-cookie' {
    interface CookieAttributes {
        expires?: number | Date;
        path?: string;
        domain?: string;
        secure?: boolean;
        sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None';
        [property: string]: any;
    }

    interface CookiesStatic {
        get(name: string): string | undefined;
        get(): { [key: string]: string };
        getJSON(name: string): any;
        getJSON(): { [key: string]: any };
        set(name: string, value: string | object, options?: CookieAttributes): string | undefined;
        remove(name: string, options?: CookieAttributes): void;
        withAttributes(attributes: CookieAttributes): CookiesStatic;
        withConverter(converter: any): CookiesStatic;
    }

    const Cookies: CookiesStatic;

    export default Cookies;
}
