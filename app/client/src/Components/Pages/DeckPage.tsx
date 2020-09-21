import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useFetchDeckQuery } from './../../api/ApolloClient';
import { Card } from 'Models/Cards';
import CardPage from './CardPage';
import { get } from 'lodash';
import { Deck } from 'Models/Decks';

interface DeckPage {}

//this is a bad pattern, just use parent render prop to pass in deck id...
const DeckPage: React.FC<DeckPage> = () => {
    const history = useHistory(),
        { deckId } = useParams(),
        { loading, data } = useFetchDeckQuery(deckId),
        [deck, setDeck] = useState<Deck>(),
        activeCardIdx = useRef(0);

    useEffect(() => {
        setDeck(get(data, 'deck'));
    }, [get(data, 'deck')]);

    if (get(deck, 'type') === 'chess') {
        (deck.cards || []).sort(chessSort);
    }

    const nextCard = () => {
            activeCardIdx.current = activeCardIdx.current === deck.cards.length - 1 ? 0 : activeCardIdx.current + 1;
            history.push(`/decks/${deckId}/cards/${getCard().id}`);
        },
        getCard = () => deck.cards[activeCardIdx.current],
        previousCard = () => {
            activeCardIdx.current = activeCardIdx.current === 0 ? deck.cards.length - 1 : activeCardIdx.current - 1;
            history.push(`/decks/${deckId}/cards/${getCard().id}`);
        };
    return deck ? (
        <CardPage
            getCard={getCard}
            getIndex={() => activeCardIdx.current}
            deck={deck}
            requestNextCard={nextCard}
            requestPreviousCard={previousCard}
        />
    ) : null;
};

export default DeckPage;

const chessSort = (a: Card, b: Card) => (transformHandle(a.handle) > transformHandle(b.handle) ? 1 : -1);

const transformHandle = (handle: string) => {
    const [move, side] = handle.split(''),
        order = side === 'w' ? 1 : 2;
    return +`${move}${order}`;
};
