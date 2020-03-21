import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

interface ModelList {
    innerLinkComponent?: React.ComponentType<{ displayName: string; _id: string }>;
    items: { [key: string]: any; _id: string }[];
    displayNameField: string;
    onItemClick: (modelId: string) => void;
}

const useCardListStyles = makeStyles(theme =>
    createStyles({
        item: {
            cursor: 'pointer',
        },
        list: {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
        },
        link: {
            flexGrow: 1,
        },
    })
);

const ModelList: React.FC<ModelList> = ({ innerLinkComponent: Component, items, displayNameField, onItemClick }) => {
    const classes = useCardListStyles();
    return (
        <List className={classes.list}>
            {items.map(item => (
                <ListItem className={classes.item} key={item._id}>
                    <Link className={classes.link} onClick={onItemClick.bind(null, item._id)}>
                        {Component ? (
                            <Component {...{ displayName: item[displayNameField], _id: item._id }} />
                        ) : displayNameField ? (
                            item[displayNameField]
                        ) : (
                            item.handle || item.name || item._id
                        )}
                    </Link>
                </ListItem>
            ))}
        </List>
    );
};

export default ModelList;
