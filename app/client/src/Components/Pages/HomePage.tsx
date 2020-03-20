import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { addDeckMutation, fetchDeckNamesQuery, useApolloMutation, useApolloQuery } from '../../api/ApolloClient';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Add from '@material-ui/icons/Add';
import Edit from '@material-ui/icons/Edit';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { Deck } from 'Models/Decks';
import MenuItem from './../MenuItem';
import ModelList from './../ModelList';
import { Typography } from '@material-ui/core';

interface HomePage {}

const HomePage: React.FC<HomePage> = ({}) => {
    const history = useHistory(),
        [newTitleText, setNewTitleText] = useState<string>(''),
        { data } = useApolloQuery<{ decks: Deck[] }>(fetchDeckNamesQuery),
        [addDeck] = useApolloMutation<{ deckId: string }>(addDeckMutation);

    return (
        <Paper>
            {data && (
                <>
                    <MenuItem title="Browse Deck">
                        <ModelList
                            displayNameField="name"
                            items={data.decks}
                            onItemClick={(deckId: string) => alert('not redirecting to run page right now')}
                            innerLinkComponent={DeckRow}
                        />
                    </MenuItem>
                    <MenuItem title="Make a Deck">
                        <Grid container>
                            <Grid item>
                                <TextField
                                    value={newTitleText}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setNewTitleText(e.currentTarget.value)
                                    }
                                    required
                                    label="name"
                                />
                            </Grid>
                            <Grid item>
                                <Button
                                    onClick={() => {
                                        addDeck({ variables: { name: newTitleText } }).then(res =>
                                            history.push(`editDeck/${res.data.deckId}`)
                                        );
                                    }}
                                    variant="contained"
                                >
                                    Go
                                </Button>
                            </Grid>
                        </Grid>
                    </MenuItem>
                </>
            )}
        </Paper>
    );
};

export default HomePage;

const DeckRow: React.FC<{ displayName: string; _id: string }> = ({ displayName, _id }) => {
    const history = useHistory();

    return (
        <span>
            <Typography>{displayName}</Typography>
            <Edit
                onClick={e => {
                    e.stopPropagation();
                    history.push(`/editDeck/${_id}`);
                }}
            />
        </span>
    );
};
