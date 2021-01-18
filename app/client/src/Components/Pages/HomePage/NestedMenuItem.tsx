import React from 'react';
import { Accordion, AccordionSummary, AccordionActions, List, Box, ListItem } from '@material-ui/core';
import { Deck } from 'Models/Decks';
import MenuItem from './../../MenuItem';
import { CategoryTreeItem } from './NestedMenuList';

interface NestedMenuItem {
    categoryName: string;
    childItems?: CategoryTreeItem[];
    decks?: Deck[];
    depth: number;
    open: boolean;
}

/* todo: each of these needs state to keep track of open child (only one at a time) */
const NestedMenuItem: React.FC<NestedMenuItem> = ({ categoryName, childItems, decks, depth, open }) => (
    <Accordion>
        <AccordionSummary>{categoryName}</AccordionSummary>
        <AccordionActions>
            <Box>
                <List>
                    {decks.map((c) => (
                        <ListItem>
                            <MenuItem title={c.name} />
                        </ListItem>
                    ))}
                </List>
            </Box>
            <Box ml={depth + 1}>
                <List>
                    {childItems.map((c) => (
                        <ListItem>
                            <NestedMenuItem
                                categoryName={c.categoryName}
                                childItems={c.categoryChildren}
                                decks={c.categoryMembers}
                                depth={depth + 1}
                                open={false}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </AccordionActions>
    </Accordion>
);

export default NestedMenuItem;
