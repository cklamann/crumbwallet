import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import { noop } from 'lodash';

interface MenuItem {
    title: string | React.ReactElement;
    onClick?: () => void;
}

const baseExpansionPanelStyle = {
    margin: '2px !important',
    padding: '2px',
    minHeight: '30px',
};

const useMenuStyles = makeStyles((theme) =>
    createStyles({
        root: baseExpansionPanelStyle,
        content: { margin: '8px 0px !important' },
        details: {
            display: 'flex',
            alignItems: 'center',
            paddingTop: '0px',
            paddingBottom: '0px',
            overflow: 'auto',
        },
    })
);

const MenuItem: React.FC<MenuItem> = ({ children, onClick, title }) => {
    const classes = useMenuStyles(),
        showChildren = onClick ? false : true;
    return (
        <Accordion onClick={(onClick || noop).bind(null)} classes={{ root: classes.root }}>
            <AccordionSummary classes={{ content: classes.content }} style={{ minHeight: '0px' }}>
                {React.isValidElement(title) ? title : <Typography>{title}</Typography>}
            </AccordionSummary>
            {showChildren && <AccordionDetails className={classes.details}>{children}</AccordionDetails>}
        </Accordion>
    );
};

export default MenuItem;
