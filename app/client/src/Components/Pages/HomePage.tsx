import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { addDeckMutation, fetchDeckNamesQuery, useApolloMutation, useApolloQuery } from '../../api/ApolloClient';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import { get } from 'lodash';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Deck } from 'Models/Decks';
import { makeStyles, createStyles } from '@material-ui/core/styles';

interface HomePage {}

const useHomePageStyles = makeStyles(theme =>
    createStyles({
        root: {},
        IconButton: {
            justifyContent: 'flex-start',
            marginLeft: theme.spacing(2),
        },
        ExpansionPanel: {
            '&.Mui-expanded': {
                marginBottom: 0,
            },
        },
    })
);

const HomePage: React.FC<HomePage> = ({}) => {
    const history = useHistory(),
        [selectedDeckId, setSelectedDeckId] = useState<string>(),
        [newTitleText, setNewTitleText] = useState<string>(''),
        [selectedSection, setSelectedSection] = useState<number>(),
        { loading, refetch, data, error } = useApolloQuery<{ decks: Deck[] }>(fetchDeckNamesQuery),
        [addDeck] = useApolloMutation<{ deckId: string }>(addDeckMutation),
        toggleSelectedSection = (id: number) =>
            selectedSection === id ? setSelectedSection(null) : setSelectedSection(id),
        HomePageStyles = useHomePageStyles();

    return (
        <Paper>
            <ExpansionPanel
                expanded={selectedSection == 1}
                onClick={() => toggleSelectedSection(1)}
                className={HomePageStyles.ExpansionPanel}
            >
                <ExpansionPanelSummary>
                    <Typography>Run a Deck</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <DeckList decks={get(data, 'decks', [])} onSelect={setSelectedDeckId} selectedId={selectedDeckId} />
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
                expanded={selectedSection == 2}
                onClick={() => toggleSelectedSection(2)}
                className={HomePageStyles.ExpansionPanel}
            >
                <ExpansionPanelSummary>
                    <Typography>Edit a Deck</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <DeckList
                        decks={get(data, 'decks', [])}
                        onSelect={(deckId: string) => history.push(`/editDeck/${deckId}`)}
                        selectedId={selectedDeckId}
                    />
                </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
                expanded={selectedSection == 3}
                onClick={() => toggleSelectedSection(3)}
                className={HomePageStyles.ExpansionPanel}
            >
                <ExpansionPanelSummary>
                    <Typography>Build a Deck</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails onClick={e => e.stopPropagation()}>
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
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </Paper>
    );
};

export default HomePage;

interface DeckList {
    decks: Deck[];
    onSelect: (deckId: string) => void;
    selectedId: string;
}

const useDeckListStyles = makeStyles(theme =>
    createStyles({
        root: {
            cursor: 'pointer',
        },
    })
);

const DeckList: React.FC<DeckList> = ({ decks, onSelect, selectedId }) => {
    const classes = useDeckListStyles();
    return (
        <List>
            {decks.map(d => (
                <ListItem className={classes.root} selected={selectedId === d._id} key={d._id}>
                    <Link underline="hover" onClick={() => onSelect(d._id)}>
                        {d.name}
                    </Link>
                </ListItem>
            ))}
        </List>
    );
};
