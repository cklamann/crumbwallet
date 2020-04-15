import { Try } from './Tries';

export interface Card {
    id?: any;
    answer: string;
    details: string;
    handle: string;
    choices: string[];
    imageKey?: string;
    tries: Try[];
    prompt: string;
    created: Date;
    updated: Date;
}