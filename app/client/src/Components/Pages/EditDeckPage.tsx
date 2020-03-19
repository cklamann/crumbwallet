import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Deck } from 'Models/Decks';
import { Card } from 'Models/Cards';
import {
    addCardMutation,
    useApolloMutation,
    useApolloQuery,
    fetchDeckQuery,
    updateDeckMutation,
} from '../../api/ApolloClient';
import Paper from '@material-ui/core/Paper';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { withAuthenticator } from 'aws-amplify-react'; 


interface EditDeckPage {}

const EditDeckPage: React.FC<EditDeckPage> = ({}) => {
    const { deckId } = useParams(),
        [newName, setNewName] = useState(''),
        [updateLoading, setUpdateLoading] = useState(false),
        { loading: deckLoading, data, refetch: refetchDeck } = useApolloQuery<{ deck: Deck }>(fetchDeckQuery, {
            variables: { _id: deckId },
        }),
        [createCard] = useApolloMutation<{ addCard: { _id: string } }>(addCardMutation),
        [updateDeck] = useApolloMutation<{ addCard: { _id: string } }>(updateDeckMutation),
        history = useHistory(),
        loading = updateLoading || deckLoading;
    useEffect(() => {
        if (data) {
            setNewName(data.deck.name);
        }
    }, [data]);

    return (
        <Paper>
            <span>{loading && <span>Loading!</span>}</span>

            {data && (
                <>
                    <ExpansionPanel>
                        <ExpansionPanelSummary>
                            <Typography>Deck:&nbsp;{data.deck.name}</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <Grid item>
                                <TextField
                                    value={newName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setNewName(e.currentTarget.value)
                                    }
                                    required
                                    label="name"
                                />
                            </Grid>
                            <Grid item>
                                <Button
                                    onClick={async () => {
                                        setUpdateLoading(true);
                                        await updateDeck({ variables: { name: newName, _id: data.deck._id } });
                                        await refetchDeck();
                                        setUpdateLoading(false);
                                    }}
                                    variant="contained"
                                >
                                    Go
                                </Button>
                            </Grid>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel
                        expanded={false}
                        onClick={() =>
                            createCard({ variables: { deckId } }).then(res =>
                                history.push(`/editCard/${res.data.addCard._id}`)
                            )
                        }
                    >
                        <span />
                    </ExpansionPanel>
                    <ExpansionPanel>
                        <ExpansionPanelSummary>
                            <Typography>Edit Card</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <CardList
                                cards={data.deck.cards}
                                onSelect={(cardId: string) => history.push(`/editCard/${cardId}`)}
                                selectedId={''}
                            />
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </>
            )}
        </Paper>
    );
};

export default withAuthenticator(EditDeckPage);

interface CardList {
    cards: Card[];
    onSelect: (cardId: string) => void;
    selectedId: string;
}

const useCardListStyles = makeStyles(theme =>
    createStyles({
        root: {
            cursor: 'pointer',
        },
    })
);

const CardList: React.FC<CardList> = ({ cards, onSelect, selectedId }) => {
    const classes = useCardListStyles();
    return (
        <List>
            {cards.map(c => (
                <ListItem className={classes.root} selected={selectedId === c._id} key={c._id}>
                    <Link underline="hover" onClick={() => onSelect(c._id)}>
                        {c.handle || c._id}
                    </Link>
                </ListItem>
            ))}
        </List>
    );
};
