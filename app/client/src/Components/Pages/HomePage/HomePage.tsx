import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Edit from '@material-ui/icons/Edit';
import MenuItem from '../../MenuItem';
import ModelList from '../../ModelList';
import { Deck } from 'Models/Decks';
import { Typography } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Modal from '../../Modals/Modal';
import NewDeckForm from './NewDeckForm';
import { useDeleteDeckMutation, useFetchDecksQuery } from '../../../api/ApolloClient';

interface HomePage {}

const useHomePageStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
        },
    })
);

const HomePage: React.FC<HomePage> = ({}) => {
    const history = useHistory(),
        { data, refetch } = useFetchDecksQuery(),
        classes = useHomePageStyles();
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
                        <NewDeckForm />
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
