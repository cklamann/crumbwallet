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
import { MenuLink } from 'Shared';
import { Edit } from '@material-ui/icons';

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

const useClasses = makeStyles((theme) =>
    createStyles({
        Details: {
            padding: '0px',
        },
        ListItem: {
            padding: '0px',
        },
        Accordion: {
            boxShadow: (props: { childMenu: boolean }) => (props.childMenu ? 'none' : 'inherit'),
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
        classes = useClasses({ childMenu }),
        [openChildId, setOpenChildId] = useState<string>(),
        toggleChildOpen = (id: string) => (id === openChildId ? setOpenChildId(null) : setOpenChildId(id));

    return (
        <Accordion className={classes.Accordion} expanded={openId === id}>
            <AccordionSummary onClick={(e) => toggleOpen(id)}>
                <Typography>{categoryName}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.Details} onClick={(e) => e.stopPropagation()}>
                <Grid container>
                    <Grid container item xs={12}>
                        <Box pl={depth + 3} flexGrow={1}>
                            <NoPaddingList disablePadding={true}>
                                {(decks || [])
                                    .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
                                    .map((c) => (
                                        <ListItem className={classes.ListItem} disableGutters={true} key={c.id}>
                                            <Grid container justify="space-between" alignItems="center">
                                                <Grid item xs={10}>
                                                    <Typography>
                                                        <MenuLink to={`decks/${c.id}/cards`}>{c.name}</MenuLink>
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <IconButton
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            goto(`decks/${c.id}/edit`);
                                                        }}
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                    ))}
                            </NoPaddingList>
                        </Box>
                    </Grid>
                    <Grid container item xs={12}>
                        <Box ml={depth + 4}>
                            <NoPaddingList disablePadding={true}>
                                {(childItems || [])
                                    .sort((a, b) =>
                                        a.categoryName.toLowerCase() > b.categoryName.toLowerCase() ? 1 : -1
                                    )
                                    .map((c, i) => (
                                        <ListItem
                                            onClick={(e) => e.stopPropagation()}
                                            className={classes.ListItem}
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
                            </NoPaddingList>
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
