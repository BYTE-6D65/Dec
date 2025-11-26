import { isServer } from "solid-js/web";
import { getCookie as getVinxiCookie } from "vinxi/http";
import { getRequestEvent } from "solid-js/web";
import { parse } from "cookie"; // We might need to install this or use a simple parser

export const getCookie = (name: string): string | null => {
    try {
        if (isServer) {
            // Try vinxi first
            try {
                const value = getVinxiCookie(name);
                if (value) return value;
            } catch (e) { /* ignore */ }

            // Fallback to request event
            try {
                const event = getRequestEvent();
                if (event && event.request) {
                    const cookieHeader = event.request.headers.get("cookie");
                    if (cookieHeader) {
                        const cookies = parse(cookieHeader);
                        return cookies[name] || null;
                    }
                }
            } catch (e) { /* ignore */ }

            return null;
        } else {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            if (match) return match[2];
            return null;
        }
    } catch (e) {
        return null;
    }
};

export const setCookie = (name: string, value: string, days = 365) => {
    if (isServer) return; // We typically set cookies on client interactions
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
};
