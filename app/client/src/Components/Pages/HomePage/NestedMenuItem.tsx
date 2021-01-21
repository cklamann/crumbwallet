import React, { useState } from 'react';
import {
    Accordion,
    AccordionSummary,
    List,
    Box,
    ListItem,
    makeStyles,
    AccordionDetails,
    withStyles,
    createStyles,
    Typography,
    Grid,
    IconButton,
} from '@material-ui/core';
import { Deck } from 'Models/Decks';
import { CategoryTreeItem } from './NestedMenuList';
import { useGoTo } from 'Hooks';
import { BaseRouterLink } from 'Shared';
import { Edit, ExpandMore } from '@material-ui/icons';

interface NestedMenuItem {
    categoryName: string;
    childItems?: CategoryTreeItem[];
    childMenu?: boolean;
    decks?: Deck[];
    depth: number;
    id: string;
    memberId?: string;
    openId: string;
    toggleOpen: (id: string) => void;
}

const useClassNames = makeStyles((theme) =>
    createStyles({
        Details: {
            padding: '0px',
            marginLeft: theme.spacing(1),
        },
        ListItem: {
            padding: '0px',
        },
        Icon: {
            fontSize: 'inherit',
        },
    })
);

const useAccordionClasses = makeStyles((theme) =>
    createStyles({
        root: {
            boxShadow: (props: { childMenu: boolean }) => (props.childMenu ? 'none' : 'inherit'),
            flexGrow: 1,
        },
        expanded: {},
    })
);

const useAccordionSummaryClasses = makeStyles((theme) =>
    createStyles({
        root: {
            padding: '0px',
            marginLeft: theme.spacing(1),
        },
        expanded: {
            padding: '0px',
            marginLeft: theme.spacing(1),
        },
    })
);

const NestedMenuItem: React.FC<NestedMenuItem> = ({
    categoryName,
    childItems,
    childMenu,
    decks,
    depth,
    id,
    openId,
    toggleOpen,
}) => {
    const goto = useGoTo(),
        classNames = useClassNames({ childMenu }),
        accordionClasses = useAccordionClasses(),
        accordionSummaryClasses = useAccordionSummaryClasses(),
        [openChildId, setOpenChildId] = useState<string>(),
        toggleChildOpen = (id: string) => (id === openChildId ? setOpenChildId(null) : setOpenChildId(id));

    return (
        <Accordion
            classes={{ root: accordionClasses.root, expanded: accordionClasses.expanded }}
            expanded={openId === id}
        >
            <AccordionSummary
                classes={{ root: accordionSummaryClasses.root, expanded: accordionSummaryClasses.expanded }}
                onClick={() => toggleOpen(id)}
                expandIcon={<ExpandMore />}
                IconButtonProps={{ edge: false }}
            >
                <Typography>{categoryName}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classNames.Details} onClick={(e) => e.stopPropagation()}>
                <Grid container>
                    <Grid container item xs={12}>
                        <Box flexGrow={1} ml={1.5}>
                            <List disablePadding={true}>
                                {(decks || [])
                                    .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
                                    .map((c) => (
                                        <ListItem className={classNames.ListItem} disableGutters={true} key={c.id}>
                                            <Grid container justify="space-between" alignItems="center">
                                                <Grid item xs={10}>
                                                    <StyledMenuLink to={`decks/${c.id}/cards`} name={c.name} />
                                                </Grid>
                                                <Grid container justify="flex-end" item xs={2}>
                                                    <Box pr={1}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                goto(`decks/${c.id}/edit`);
                                                            }}
                                                        >
                                                            <Edit className={classNames.Icon} />
                                                        </IconButton>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                    ))}
                            </List>
                        </Box>
                    </Grid>
                    <Grid container item xs={12}>
                        <Box flexGrow={1}>
                            <List disablePadding={true}>
                                {(childItems || [])
                                    .sort((a, b) =>
                                        a.categoryName.toLowerCase() > b.categoryName.toLowerCase() ? 1 : -1
                                    )
                                    .map((c, i) => (
                                        <ListItem
                                            onClick={(e) => e.stopPropagation()}
                                            className={classNames.ListItem}
                                            disableGutters={true}
                                            key={i}
                                        >
                                            <NestedMenuItem
                                                categoryName={c.categoryName}
                                                childItems={c.categoryChildren}
                                                childMenu={true}
                                                decks={c.categoryMembers}
                                                depth={depth + 1}
                                                id={`${id}-${i}`}
                                                openId={openChildId}
                                                toggleOpen={toggleChildOpen}
                                            />
                                        </ListItem>
                                    ))}
                            </List>
                        </Box>
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
};

const NoPaddingList = withStyles({
    root: {
        padding: 0,
    },
})(List);

export default NestedMenuItem;

const MenuLink: React.FC<{ name: string; to: string }> = ({ to, name }) => (
    <Typography>
        <BaseRouterLink to={to}>{name}</BaseRouterLink>
    </Typography>
);

const StyledMenuLink = withStyles((theme) => ({
    root: { color: theme.palette.secondary.light },
}))(MenuLink);
