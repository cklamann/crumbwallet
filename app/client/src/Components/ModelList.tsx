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
        root: {
            cursor: 'pointer',
        },
    })
);

const ModelList: React.FC<ModelList> = ({ innerLinkComponent: Component, items, displayNameField, onItemClick }) => {
    const classes = useCardListStyles();
    return (
        <List>
            {items.map(item => (
                <ListItem className={classes.root} key={item._id}>
                    <Link onClick={onItemClick.bind(null, item._id)}>
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
