import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAddDeckMutation, useDeleteDeckMutation, useFetchDecksQuery } from '../../api/ApolloClient';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import MenuItem from './../MenuItem';
import ModelList from './../ModelList';
import { Typography } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
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

/*

    todo: add card shorcut, prompts at submit time which deck to add it to

*/

const HomePage: React.FC<HomePage> = ({}) => {
    const history = useHistory(),
        { data, refetch } = useFetchDecksQuery(),
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
                            onItemClick={(deckId: string) => history.push(`/decks/${deckId}/cards`)}
                            innerLinkComponent={withRefresh(refetch)(DeckRow)}
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
            padding: '0px',
        },
        warnIcon: {
            color: theme.palette.warning.dark,
            padding: '0px',
        },
    })
);

const DeckRow: React.FC<{ displayName: string; refresh?: () => void; _id: string }> = ({
    displayName,
    refresh,
    _id,
}) => {
    const history = useHistory(),
        [deleteDeck] = useDeleteDeckMutation(),
        classes = useDeckRowStyles();

    return (
        <span className={classes.root}>
            <Typography className={classes.root}>{displayName}</Typography>
            <IconButton
                className={classes.warnIcon}
                onClick={e => {
                    e.stopPropagation();
                    deleteDeck({ variables: { _id } }).then(() => refresh());
                }}
            >
                <Close />
            </IconButton>
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

const withRefresh = (refresh: () => void) => (Component: React.ComponentType) => (props: any) => {
    const newProps = { ...props, refresh };
    return <Component {...newProps} />;
};
