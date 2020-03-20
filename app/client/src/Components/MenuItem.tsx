import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

interface MenuItem {
    title: string | React.ReactElement;
}

const baseExpansionPanelStyle = {
    margin: '2px !important',
    padding: '2px',
    minHeight: '30px',
};

const useMenuStyles = makeStyles(theme =>
    createStyles({
        root: baseExpansionPanelStyle,
        content: { margin: '8px 0px !important' },
        details: {
            paddingTop: '0px',
            paddingBottom: '0px',
            maxHeight: '150px',
            overflowY: 'scroll',
        },
    })
);

const MenuItem: React.FC<MenuItem> = ({ children, title }) => {
    const classes = useMenuStyles();
    return (
        <ExpansionPanel classes={{ root: classes.root }}>
            <ExpansionPanelSummary classes={{ content: classes.content }} style={{ minHeight: '0px' }}>
                <Typography>{title}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails className={classes.details}>{children}</ExpansionPanelDetails>
        </ExpansionPanel>
    );
};

export default MenuItem;
