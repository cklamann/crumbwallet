import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Add from '@material-ui/icons/Add';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { IconButton } from '@material-ui/core';
import { Card } from 'Models/Cards';
import { useGoTo } from './../../hooks';
import { useAddCardMutation, useFetchDeckQuery, useUpdateDeckMutation } from '../../api/ApolloClient';
import MenuItem from './../MenuItem';

interface EditDeckPage {}

const EditDeckPage: React.FC<EditDeckPage> = ({}) => {
    const { deckId } = useParams(),
        [newName, setNewName] = useState(''),
        { loading: deckLoading, data, refetch: refetchDeck } = useFetchDeckQuery(deckId),
        [createCard] = useAddCardMutation(),
        [updateDeck] = useUpdateDeckMutation();
    useEffect(() => {
        if (data) {
            setNewName(data.deck.name);
        }
    }, [data]);

    const goto = useGoTo();

    return (
        <Paper style={{ width: '100%' }}>
            {data && (
                <>
                    <MenuItem title={`Deck: ${data.deck.name}`}>
                        <Grid item>
                            <TextField
                                value={newName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.currentTarget.value)}
                                required
                                label="name"
                            />
                        </Grid>
                        <Grid item>
                            <Button
                                onClick={async () => {
                                    await updateDeck({ variables: { name: newName, id: data.deck.id } });
                                    await refetchDeck();
                                }}
                                variant="contained"
                            >
                                Update
                            </Button>
                        </Grid>
                    </MenuItem>
                    <MenuItem title="Go to deck">
                        {data.deck.cards.length && (
                            <IconButton onClick={() => goto(`/decks/${deckId}`)}>
                                <LibraryBooks />
                            </IconButton>
                        )}
                    </MenuItem>
                    <MenuItem title="Edit Card">
                        {data.deck.cards.length ? (
                            <CardList
                                cards={data.deck.cards}
                                onSelect={(cardId: string) => goto(`/decks/${deckId}/cards/${cardId}/edit`)}
                            />
                        ) : (
                            <Typography color="error">No Cards!</Typography>
                        )}
                    </MenuItem>
                    <MenuItem
                        title={
                            <span
                                style={{ display: 'flex' }}
                                onClick={() =>
                                    createCard({
                                        variables: {
                                            answer: '',
                                            deckId,
                                            details: '<p>New Details</p>',
                                            handle: '',
                                            imageKey: null,
                                            prompt: 'New Prompt',
                                            type: 'standard',
                                        },
                                    }).then((res) => goto(`/decks/${deckId}/cards/${res.data.addCard.id}/edit`))
                                }
                            >
                                Create Card
                                <Add />
                            </span>
                        }
                    >
                        <span />
                    </MenuItem>
                </>
            )}
        </Paper>
    );
};

export default EditDeckPage;

interface CardList {
    cards: Card[];
    onSelect: (cardId: string) => void;
}

const useCardListStyles = makeStyles((theme) =>
    createStyles({
        root: {
            cursor: 'pointer',
        },
    })
);

const CardList: React.FC<CardList> = ({ cards, onSelect }) => {
    const classes = useCardListStyles();
    return (
        <List>
            {cards.map((c) => (
                <ListItem className={classes.root} key={c.id}>
                    <Link onClick={() => onSelect(c.id)}>{c.handle || c.id}</Link>
                </ListItem>
            ))}
        </List>
    );
};
