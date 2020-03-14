import { useLocation } from 'react-router-dom';
import { Deck } from 'Models/Decks';
import { useApolloQuery, fetchDeckQuery } from '../../api/ApolloClient';
import { ThemeProvider, makeStyles, createStyles } from '@material-ui/core/styles';
import React from 'react';
import Paper from '@material-ui/core/Paper';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';

const useQuery = () => new URLSearchParams(useLocation().search);

interface EditDeckPage {}

const EditDeckPage: React.FC<EditDeckPage> = ({}) => {
    const deckId = useQuery().get('deckId'),
        { loading, refetch, data, error } = useApolloQuery<{ deck: Deck }>(fetchDeckQuery, {
            variables: { _id: deckId },
        });

    return (
        <Paper>
            <span>{loading && <span>Loading!</span>}</span>

            {data && (
                <>
                    <ExpansionPanel>
                        <ExpansionPanelSummary>
                            <Typography>{data.deck.name}</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>Edit name</ExpansionPanelDetails>
                    </ExpansionPanel>
                    {/* onclick, create and redirect */}
                    <ExpansionPanel expanded={false}>
                        <ExpansionPanelSummary>
                            <Typography>Add Card</Typography>
                        </ExpansionPanelSummary>
                    </ExpansionPanel>
                    <ExpansionPanel>
                        <ExpansionPanelSummary>
                            <Typography>Edit Card</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>Select Card</ExpansionPanelDetails>
                    </ExpansionPanel>
                </>
            )}
        </Paper>
    );
};

//can either edit deckname, etc or select a card or create a card
//for this we need card carousel with thunmnail? and edit/delete buttons

export default EditDeckPage;
