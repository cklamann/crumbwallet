import React from 'react';
import Paper from '@material-ui/core/Paper';
import { useFetchDecksQuery } from '../../../api/ApolloClient';
import NestedItemList from './NestedMenuList';
import { get } from 'lodash';
import { Box } from '@material-ui/core';

interface HomePage {}

const HomePage: React.FC<HomePage> = ({}) => {
    const { data } = useFetchDecksQuery();

    return (
        <Box width="100%">
            <Paper>{get(data, 'decks') && <NestedItemList decks={data.decks} />}</Paper>
        </Box>
    );
};

export default HomePage;
