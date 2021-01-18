import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFetchDeckQuery } from './../../api/ApolloClient';
import { Card } from 'Models/Cards';
import CardPage from './CardPage';
import { findIndex, get } from 'lodash';
import { Deck } from 'Models/Decks';
import Modal from '../Modals/Modal';
import { useGoTo } from 'Hooks';

interface DeckPage {}

const DeckPage: React.FC<DeckPage> = () => {
    const { deckId, cardId } = useParams(),
        { loading, data } = useFetchDeckQuery(deckId),
        [deck, setDeck] = useState<Deck>(),
        [emptyModalOpen, setEmptyModalOpen] = useState<boolean>(),
        activeCardIdx = useRef(0),
        goto = useGoTo();

    useEffect(() => {
        if (data && data.deck) {
            if (data.deck.type === 'chess') {
                data.deck.cards = chessSort(data.deck.cards || []);
            }
            activeCardIdx.current = cardId ? findIndex(data.deck.cards, (c) => c.id === cardId) : 0;
            setDeck(data.deck);
            if (!cardId && data.deck.cards.length) {
                goto(`/decks/${deckId}/cards/${data.deck.cards[0].id}`);
            } else {
                setEmptyModalOpen(true);
            }
        }
    }, [get(data, 'deck')]);

    const nextCard = () => {
            activeCardIdx.current = activeCardIdx.current === deck.cards.length - 1 ? 0 : activeCardIdx.current + 1;
            goto(`/decks/${deckId}/cards/${getCard().id}`);
        },
        getCard = () => deck.cards[activeCardIdx.current],
        previousCard = () => {
            activeCardIdx.current = activeCardIdx.current === 0 ? deck.cards.length - 1 : activeCardIdx.current - 1;
            goto(`/decks/${deckId}/cards/${getCard().id}`);
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
                onClose={() => goto('/')}
                title="No Cards!"
            />
        )
    ) : null;
};

export default DeckPage;

const chessSort = (cards: Card[]) => {
    const moveCards = cards.filter((card) => isMoveCard(card)).sort(moveSort),
        introCards = cards.filter((card) => /^intro/.test(card.handle)).sort(handleSort),
        outroCards = cards.filter((card) => /^outro/.test(card.handle)).sort(handleSort);
    return [...introCards, ...moveCards, ...outroCards];
};

const isMoveCard = (card: Card) => /^\d+(b|w)$/.test(card.handle);

const handleSort = (a: Card, b: Card) => (a.handle.toLowerCase() < b.handle.toLowerCase() ? -1 : 1);

const moveSort = (a: Card, b: Card) => (transformHandle(a.handle) > transformHandle(b.handle) ? 1 : -1);

const transformHandle = (handle: string) => {
    const move = handle.slice(0, handle.length - 1),
        order = handle.slice(-1) === 'w' ? 1 : 2;
    return +`${move}${order}`;
};
