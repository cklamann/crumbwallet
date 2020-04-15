import { Card } from './Cards';

export interface Deck {
    id: string;
    name: string;
    cards: Card[];
    categories: string[];
    created: Date;
    updated: Date;
}
