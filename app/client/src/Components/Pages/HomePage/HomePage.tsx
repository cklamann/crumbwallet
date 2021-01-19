import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import Add from '@material-ui/icons/Add';
import MenuItem from '../../MenuItem';
import ModelList from '../../ModelList';
import { Deck } from 'Models/Decks';
import { Typography, Grid } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Modal from '../../Modals/Modal';
import { useDeleteDeckMutation, useFetchDecksQuery } from '../../../api/ApolloClient';
import { useGoTo } from 'Hooks';
import NestedItemList from './NestedMenuList';
import { get } from 'lodash';

interface HomePage {}

const useHomePageStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
        },
    })
);

const HomePage: React.FC<HomePage> = ({}) => {
    const { data } = useFetchDecksQuery(),
        classes = useHomePageStyles();

    return (
        <Paper className={classes.root}>
            {get(data, 'decks') && <NestedItemList decks={data.decks.sort((a, b) => (a.name > b.name ? 1 : -1))} />}
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

interface TitleRow {
    gotoCreateDeckPage: () => void;
}

const TitleRow: React.FC<TitleRow> = ({ gotoCreateDeckPage }) => (
    <Grid container alignItems="center" justify="space-between">
        <Grid item>
            <Typography>Browse Decks</Typography>
        </Grid>
        <Grid item>
            <IconButton onClick={gotoCreateDeckPage}>
                <Add />
            </IconButton>
        </Grid>
    </Grid>
);

interface DeckRow {
    displayName: string;
    refresh?: () => void;
    id: string;
}

const DeckRow: React.FC<DeckRow> = ({ displayName, refresh, id }) => {
    const goto = useGoTo(),
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
                    goto(`/decks/${id}/edit`);
                }}
            >
                <Edit />
            </IconButton>
            <span onClick={(e) => e.stopPropagation()}>
                <Modal
                    acceptText="Yes"
                    content={`Are you sure you want to delete ${displayName}?`}
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
