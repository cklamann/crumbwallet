import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import ArrowBack from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import { useGoTo } from 'Hooks';

interface BackButton {}

const BackButton: React.FC<BackButton> = ({}) => {
    const { deckId, cardId, tryID } = useParams(),
        goto = useGoTo(),
        history = useHistory(),
        handleClick = () => {
            if (/decks.+cards.+edit/.test(history.location.pathname)) {
                return goto(`/decks/${deckId}/edit`);
            } else return goto('/');
        };

    return (
        <IconButton onClick={handleClick}>
            <ArrowBack />
        </IconButton>
    );
};

export default BackButton;
