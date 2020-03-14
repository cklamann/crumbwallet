import { useLocation } from 'react-router-dom';
import { Card } from 'Models/Cards';
import { fetchCardQuery, updateCardMutation, useApolloMutation, useApolloQuery } from '../../api/ApolloClient';
import { ThemeProvider, makeStyles, createStyles } from '@material-ui/core/styles';
import React from 'react';
import Paper from '@material-ui/core/Paper';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';

const useQuery = () => new URLSearchParams(useLocation().search);

interface EditCardPage {}

const EditCardPage: React.FC<EditCardPage> = ({}) => {
    console.log("ERE")
    const cardId = useQuery().get('cardId'),
        { loading, refetch, data, error } = useApolloQuery<{ card: Card }>(fetchCardQuery, {
            variables: { _id: cardId },
        }),
        [updateCard] = useApolloMutation<{ addCard: { _id: string } }>(updateCardMutation);

    return (
        <Paper>
            <span>{loading && <span>Loading!</span>}</span>

            {data && <form></form>}
        </Paper>
    );
};

export default EditCardPage;
