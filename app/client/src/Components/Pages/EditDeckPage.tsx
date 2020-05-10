import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Card } from 'Models/Cards';
import { useAddCardMutation, useFetchDeckQuery, useUpdateDeckMutation } from '../../api/ApolloClient';
import MenuItem from './../MenuItem';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Add from '@material-ui/icons/Add';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

interface EditDeckPage {}

const EditDeckPage: React.FC<EditDeckPage> = ({}) => {
    const { deckId } = useParams(),
        [newName, setNewName] = useState(''),
        [updateLoading, setUpdateLoading] = useState(false),
        { loading: deckLoading, data, refetch: refetchDeck } = useFetchDeckQuery(deckId),
        [createCard] = useAddCardMutation(),
        [updateDeck] = useUpdateDeckMutation(),
        history = useHistory(),
        loading = updateLoading || deckLoading;
    useEffect(() => {
        if (data) {
            setNewName(data.deck.name);
        }
    }, [data]);

    return (
        <Paper>
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
                    <MenuItem title="Edit Card">
                        {data.deck.cards.length ? (
                            <CardList
                                cards={data.deck.cards}
                                onSelect={(cardId: string) => history.push(`/decks/${deckId}/cards/${cardId}/edit`)}
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
                                    createCard({ variables: { deckId, type: 'standard' } }).then((res) =>
                                        history.push(`/decks/${deckId}/cards/${res.data.addCard.id}/edit`)
                                    )
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
