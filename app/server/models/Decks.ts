import { Card } from './Cards';

export interface Deck {
    cards: Card[];
    category: string;
    created: Date;
    id: string;
    name: string;
    type?: 'chess';
    updated: Date;
}
