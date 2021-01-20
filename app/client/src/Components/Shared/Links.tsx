import { createStyles, makeStyles } from '@material-ui/core';
import React from 'react';
import { LinkProps as RouterLinkProps, Link as RouterLink } from 'react-router-dom';

const useMenuLinkStyles = makeStyles((theme) =>
    createStyles({
        root: {
            color: 'inherit',
            textDecoration: 'none',
        },
    })
);

export const MenuLink: React.FC<RouterLinkProps> = (props) => {
    const classes = useMenuLinkStyles();
    return <RouterLink {...props} className={classes.root} />;
};
