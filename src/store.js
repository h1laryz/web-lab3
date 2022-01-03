import { writable } from "svelte/store";

export const isOffline = writable(false);
export const requestCounter = writable(0);
export const errorMessage = writable("");
