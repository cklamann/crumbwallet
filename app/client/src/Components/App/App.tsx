import React, { useEffect, useState } from 'react';
import EditDeckPage from '../Pages/EditDeckPage';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import { theme } from './../Style/Theme';
import { Deck } from 'Models/Decks';
import { useApolloQuery, fetchDeckNamesQuery } from '../../api/ApolloClient';
import { ThemeProvider, makeStyles, createStyles } from '@material-ui/core/styles';
import { get } from 'lodash';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Home';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';

/* 

    notes:
        pages:
            home
                1) run a deck
                    - pick a deck
                        - browse list or filter or browse by category
                        - component loads them all up front
                2) update a deck
                    - browse list or search or browse by category
                    - component loads them all up front
                    - update deck or update card?
                        - select card
                            - browse list or search
                            - update card form
                        - select deck
                            - update deck form
                            - add card
                                - add card form
                3) create a deck
                    - create deck form
            create/update deck page
            run deck page
        
        mobile first!

*/

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

export default () => {
    const [selectedSection, setSelectedSection] = useState<number>(),
        [selectedDeckId, setSelectedDeckId] = useState<string>(),
        [newTitleText, setNewTitleText] = useState<string>(''),
        HomePageStyles = useHomePageStyles(),
        { loading, refetch, data, error } = useApolloQuery<{ decks: Deck[] }>(fetchDeckNamesQuery),
        toggleSelectedSection = (id: number) =>
            selectedSection === id ? setSelectedSection(null) : setSelectedSection(id);

    return (
        <Container maxWidth="lg">
            <ThemeProvider theme={theme}>
                <AppBar className={HomePageStyles.root} position="static">
                    <IconButton className={HomePageStyles.IconButton} edge="start">
                        <HomeIcon />
                    </IconButton>
                </AppBar>
                <Router>
                    <Switch>
                        <Route exact path="/editDeck*">
                            <EditDeckPage />
                        </Route>

                        <Route path="/*">
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
                                        <DeckList
                                            decks={get(data, 'decks', [])}
                                            onSelect={setSelectedDeckId}
                                            selectedId={selectedDeckId}
                                        />
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
                                            onSelect={setSelectedDeckId}
                                            selectedId={selectedDeckId}
                                        />
                                    </ExpansionPanelDetails>
                                </ExpansionPanel>
                                <ExpansionPanel
                                    expanded={selectedSection == 3}
                                    onClick={() => toggleSelectedSection(3)}
                                    className={HomePageStyles.ExpansionPanel}
                                >
                                    {/* onclick: opens up, enter name, hit Create button, takes you to edit page */}
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
                                            <Grid>
                                                <Button variant="contained">Go</Button>
                                            </Grid>
                                        </Grid>
                                    </ExpansionPanelDetails>
                                </ExpansionPanel>
                            </Paper>
                        </Route>
                    </Switch>
                </Router>
            </ThemeProvider>
        </Container>
    );
};

interface DeckList {
    decks: Deck[];
    onSelect: (deckId: string) => void;
    selectedId: string;
}

const DeckList: React.FC<DeckList> = ({ decks, onSelect, selectedId }) => {
    return (
        <List>
            {decks.map(d => (
                <ListItem selected={selectedId === d._id} onClick={onSelect.bind(d._id)} key={d._id}>
                    {d.name}
                </ListItem>
            ))}
        </List>
    );
};
