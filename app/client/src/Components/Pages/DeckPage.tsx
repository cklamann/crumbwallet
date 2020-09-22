import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useFetchDeckQuery } from './../../api/ApolloClient';
import { Card } from 'Models/Cards';
import CardPage from './CardPage';
import { findIndex, get } from 'lodash';
import { Deck } from 'Models/Decks';
import Modal from '../Modals/Modal';

interface DeckPage {}

//this is a bad pattern, just use parent render prop to pass in deck id...
const DeckPage: React.FC<DeckPage> = () => {
    const history = useHistory(),
        { deckId, cardId } = useParams(),
        { loading, data } = useFetchDeckQuery(deckId),
        [deck, setDeck] = useState<Deck>(),
        [emptyModalOpen, setEmptyModalOpen] = useState<boolean>(),
        activeCardIdx = useRef(0);

    useEffect(() => {
        //todo: need error handling... data.deck will be null if there's an error, for instance -- can get here via the back button after an unhandled error
        //once error modal works should just redirect to home page
        if (data && data.deck) {
            if (data.deck.type === 'chess') {
                (data.deck.cards || []).sort(chessSort);
            }
            activeCardIdx.current = cardId ? findIndex(data.deck.cards, (c) => c.id === cardId) : 0;
            setDeck(data.deck);
            if (!cardId && data.deck.cards.length) {
                history.push(`/decks/${deckId}/cards/${data.deck.cards[0].id}`);
            } else {
                setEmptyModalOpen(true);
            }
        }
    }, [get(data, 'deck')]);

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
        deck.cards.length ? (
            <CardPage
                card={deck.cards[activeCardIdx.current]}
                cardIndex={activeCardIdx.current}
                deckId={deck.id}
                deckName={deck.name}
                requestNextCard={nextCard}
                requestPreviousCard={previousCard}
            />
        ) : (
            <Modal
                isOpen={emptyModalOpen}
                content="There are no cards in this deck yet"
                onClose={() => history.push('/')}
                title="No Cards!"
            />
        )
    ) : null;
};

export default DeckPage;

const chessSort = (a: Card, b: Card) => (transformHandle(a.handle) > transformHandle(b.handle) ? 1 : -1);

const transformHandle = (handle: string) => {
    const [move, side] = handle.split(''),
        order = side === 'w' ? 1 : 2;
    return +`${move}${order}`;
};
