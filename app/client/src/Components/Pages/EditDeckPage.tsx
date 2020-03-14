import { useLocation, useHistory } from 'react-router-dom';
import { Deck } from 'Models/Decks';
import { addCardMutation, useApolloMutation, useApolloQuery, fetchDeckQuery } from '../../api/ApolloClient';
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
        { loading, data } = useApolloQuery<{ deck: Deck }>(fetchDeckQuery, {
            variables: { _id: deckId },
        }),
        [createCard] = useApolloMutation<{ addCard: { _id: string } }>(addCardMutation),
        history = useHistory();

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
                    <ExpansionPanel
                        expanded={false}
                        onClick={() =>
                            createCard({ variables: { deckId } }).then(res =>
                                history.push(`editCard?cardId=${res.data.addCard._id}`)
                            )
                        }
                    >
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

export default EditDeckPage;
