import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Add from '@material-ui/icons/Add';
import Edit from '@material-ui/icons/Edit';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Card } from 'Models/Cards';
import { useFormReducer, useGoTo } from './../../hooks';
import { useAddCardMutation, useFetchDeckQuery, useUpdateDeckMutation } from '../../api/ApolloClient';
import MenuItem from './../MenuItem';
import { TextInput } from 'Shared';
import { Deck } from 'Models/Decks';
import { get, mapValues } from 'lodash';

type ReducerState = Pick<Deck, 'name' | 'category'>;

const INITIAL_STATE: ReducerState = {
    name: '',
    category: '',
};

interface EditDeckPage {}

const EditDeckPage: React.FC<EditDeckPage> = ({}) => {
    const { deckId }: { deckId: string } = useParams(),
        { data, refetch: refetchDeck } = useFetchDeckQuery(deckId),
        [formState, updateField] = useFormReducer(INITIAL_STATE),
        [createCard] = useAddCardMutation(),
        [_updateDeck] = useUpdateDeckMutation(),
        updateDeck = () => {
            _updateDeck({
                variables: {
                    ...mapValues(formState, (field: any) => (field === '' ? null : field)),
                    ...{ id: deckId },
                },
            })
                .then(() => refetchDeck())
                .catch((e) => console.log(e));
        };

    useEffect(() => {
        if (get(data, 'deck')) {
            Object.entries(data.deck).map(([k, v]: [keyof ReducerState, ReducerState[keyof ReducerState]]) => {
                if (Object.keys(INITIAL_STATE).includes(k) && formState[k] != v) {
                    updateField(k)(v);
                }
            });
        }
    }, [get(data, 'deck')]);

    const goto = useGoTo();

    return (
        <Paper style={{ width: '100%' }}>
            {data && (
                <>
                    <MenuItem
                        title={
                            <Grid container justify="flex-start">
                                <Typography>{data.deck.name}</Typography>
                                <Edit />
                            </Grid>
                        }
                    >
                        <Grid item xs={12} md={6}>
                            <TextInput val={formState.name} name="name" updateFn={updateField} required />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextInput val={formState.category} name="category" updateFn={updateField} required />
                        </Grid>
                        <Grid item>
                            <Button onClick={updateDeck.bind(null, formState)} variant="contained">
                                Update
                            </Button>
                        </Grid>
                    </MenuItem>
                    <MenuItem title="Go to deck" onClick={goto.bind(null, `/decks/${deckId}/cards`)} />
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
                <ListItem classes={classes} key={c.id}>
                    <Link onClick={() => onSelect(c.id)}>{c.handle || c.id}</Link>
                </ListItem>
            ))}
        </List>
    );
};
