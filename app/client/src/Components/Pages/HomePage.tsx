import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAddDeckMutation, useFetchDecksQuery } from '../../api/ApolloClient';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import MenuItem from './../MenuItem';
import ModelList from './../ModelList';
import { Typography } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { sortBy } from 'lodash';

interface HomePage {}

const useHomePageStyles = makeStyles(theme =>
    createStyles({
        root: {},
        form: {
            flexWrap: 'nowrap',
        },
    })
);

const HomePage: React.FC<HomePage> = ({}) => {
    const history = useHistory(),
        { data } = useFetchDecksQuery(),
        [addDeck] = useAddDeckMutation(),
        [newTitleText, setNewTitleText] = useState<string>(''),
        classes = useHomePageStyles();

    return (
        <Paper>
            {data && (
                <>
                    <MenuItem title="Browse Decks">
                        <ModelList
                            displayNameField="name"
                            items={sortBy(data.decks, 'name')}
                            onItemClick={(deckId: string) => alert('not redirecting to run page right now')}
                            innerLinkComponent={DeckRow}
                        />
                    </MenuItem>
                    <MenuItem title="Make a Deck">
                        <Grid container className={classes.form}>
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
                                    onClick={() =>
                                        addDeck({ variables: { name: newTitleText } }).then(res =>
                                            history.push(`decks/${res.data.createDeck._id}/edit`)
                                        )
                                    }
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

const useDeckRowStyles = makeStyles(theme =>
    createStyles({
        root: {
            flexGrow: 1,
            display: 'flex',
            justifyContent: ' space-between',
            alignItems: 'center',
        },
        icon: {
            color: 'inherit',
        },
    })
);

const DeckRow: React.FC<{ displayName: string; _id: string }> = ({ displayName, _id }) => {
    const history = useHistory(),
        classes = useDeckRowStyles();

    return (
        <span className={classes.root}>
            <Typography className={classes.root}>{displayName}</Typography>
            <IconButton
                className={classes.icon}
                onClick={e => {
                    e.stopPropagation();
                    history.push(`/decks/${_id}/edit`);
                }}
            >
                <Edit />
            </IconButton>
        </span>
    );
};
