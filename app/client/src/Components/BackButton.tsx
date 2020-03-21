import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import ArrowBack from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';

interface BackButton {}

const BackButton: React.FC<BackButton> = ({}) => {
    const { deckId, cardId, tryID } = useParams();
    const history = useHistory(),
        handleClick = () => {
            if (history.length > 1) {
                history.goBack();
            } else if (/deckId.+cardId.+edit/.test(history.location.pathname)) {
                history.push(`/decks/${deckId}/edit`);
            }
            return history.push('/');
        };

    return (
        <IconButton onClick={handleClick}>
            <ArrowBack />
        </IconButton>
    );
};

export default BackButton;
