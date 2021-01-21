import { createStyles, makeStyles } from '@material-ui/core';
import React from 'react';
import { LinkProps as RouterLinkProps, Link as RouterLink } from 'react-router-dom';

const useBaseRouterLinkStyles = makeStyles((theme) =>
    createStyles({
        root: {
            color: 'inherit',
            textDecoration: 'none',
        },
    })
);

export const BaseRouterLink: React.FC<RouterLinkProps> = (props) => {
    const classes = useBaseRouterLinkStyles();
    return <RouterLink {...props} className={classes.root} />;
};
