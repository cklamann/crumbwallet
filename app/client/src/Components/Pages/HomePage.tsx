import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAddDeckMutation, useDeleteDeckMutation, useFetchDecksQuery } from '../../api/ApolloClient';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import MenuItem from './../MenuItem';
import { UserContext } from '../App';
import ModelList from './../ModelList';
import { Deck } from 'Models/Decks';
import { Typography } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Modal from '../Modals/Modal';

interface HomePage {}

const useHomePageStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
        },
        form: {
            flexWrap: 'nowrap',
        },
    })
);

const HomePage: React.FC<HomePage> = ({}) => {
    const history = useHistory(),
        { data, refetch } = useFetchDecksQuery(),
        [addDeck] = useAddDeckMutation(),
        [newTitleText, setNewTitleText] = useState<string>(''),
        [newDeckPrivate, setNewDeckPrivate] = useState(false),
        classes = useHomePageStyles(),
        userId = useContext(UserContext);

    return (
        <Paper className={classes.root}>
            {data && (
                <>
                    <MenuItem title="Browse Decks">
                        <ModelList
                            displayNameField="name"
                            items={data.decks.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1))}
                            onItemClick={(deck: Deck) => history.push(`/decks/${deck.id}/cards`)}
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
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={newDeckPrivate}
                                            onChange={() => setNewDeckPrivate(!newDeckPrivate)}
                                            color="primary"
                                        />
                                    }
                                    label="Private?"
                                />
                            </Grid>
                            <Grid item>
                                <Button
                                    onClick={() =>
                                        addDeck({
                                            variables: { name: newTitleText, userId, private: newDeckPrivate },
                                        }).then((res) => history.push(`decks/${res.data.createDeck.id}/edit`))
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

const useDeckRowStyles = makeStyles((theme) =>
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

interface DeckRow {
    displayName: string;
    refresh?: () => void;
    id: string;
}

const DeckRow: React.FC<DeckRow> = ({ displayName, refresh, id }) => {
    const history = useHistory(),
        [deleteDeck] = useDeleteDeckMutation(),
        [deleteClicked, setDeleteClicked] = useState(false),
        classes = useDeckRowStyles();

    return (
        <span className={classes.root}>
            <Typography className={classes.root}>{displayName}</Typography>
            <IconButton
                className={classes.warnIcon}
                onClick={(e) => {
                    e.stopPropagation();
                    setDeleteClicked(true);
                }}
            >
                <Close />
            </IconButton>
            <IconButton
                className={classes.icon}
                onClick={(e) => {
                    e.stopPropagation();
                    history.push(`/decks/${id}/edit`);
                }}
            >
                <Edit />
            </IconButton>
            <span onClick={(e) => e.stopPropagation()}>
                <Modal
                    acceptText="Yes"
                    content={`Are you shure you want to delete ${displayName}?`}
                    isOpen={!!deleteClicked}
                    onAccept={() => deleteDeck({ variables: { id } }).then(() => refresh())}
                    onClose={setDeleteClicked.bind(null, false)}
                    rejectText="Never mind"
                    title="Delete?"
                />
            </span>
        </span>
    );
};

const withRefresh = (refresh: () => void) => (Component: React.ComponentType) => (props: any) => {
    const newProps = { ...props, refresh };
    return <Component {...newProps} />;
};
