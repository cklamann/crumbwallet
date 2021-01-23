import React from 'react';
import { useFetchDecksQuery } from '../../../api/ApolloClient';
import NestedItemList from './NestedMenuList';
import { get } from 'lodash';
import { Grid } from '@material-ui/core';
import MenuItem from './../../MenuItem';
import { useGoTo } from 'Hooks';

interface HomePage {}

const HomePage: React.FC<HomePage> = ({}) => {
    const { data } = useFetchDecksQuery(),
        goto = useGoTo();

    return (
        <Grid item container direction="column" xs={12}>
            <Grid item>
                <MenuItem title="Browse Decks">{get(data, 'decks') && <NestedItemList decks={data.decks} />}</MenuItem>
            </Grid>
            <Grid>
                <MenuItem title="Make a Deck" onClick={goto.bind(null, `decks/create`)} />
            </Grid>
        </Grid>
    );
};

export default HomePage;
