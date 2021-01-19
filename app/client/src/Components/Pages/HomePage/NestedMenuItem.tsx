import React from 'react';
import { Accordion, AccordionSummary, AccordionActions, List, Box, ListItem } from '@material-ui/core';
import { Deck } from 'Models/Decks';
import MenuItem from './../../MenuItem';
import { CategoryTreeItem } from './NestedMenuList';
import { useGoTo } from 'Hooks';
import { get } from 'lodash';

interface NestedMenuItem {
    categoryName: string;
    childItems?: CategoryTreeItem[];
    decks?: Deck[];
    depth: number;
    id: string;
    memberId?: string;
    openId: string;
    toggleOpen: (id: string) => void;
}

const NestedMenuItem: React.FC<NestedMenuItem> = ({
    categoryName,
    childItems,
    decks,
    depth,
    id,
    openId,
    toggleOpen,
}) => {
    const goto = useGoTo(),
        handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (get(childItems, 'length') || get(decks, 'length', 0) > 1) {
                return toggleOpen(id);
            } else if (get(decks, 'length') === 1) {
                return goto(`decks/${decks[0].id}/cards`);
            }
        };

    return (
        <Accordion>
            <AccordionSummary onClick={handleClick}>{categoryName}</AccordionSummary>
            {openId === id && (get(childItems, 'length') || get(decks, 'length') > 1) && (
                <AccordionActions>
                    <Box>
                        <List>
                            {(decks || []).map((c) => (
                                <ListItem key={c.id}>
                                    <MenuItem title={c.name} onClick={goto.bind(null, `decks/${c.id}/cards`)} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    <Box ml={depth + 1}>
                        <List>
                            {(childItems || []).map((c, i) => (
                                <ListItem>
                                    <NestedMenuItem
                                        key={i}
                                        categoryName={c.categoryName}
                                        childItems={c.categoryChildren}
                                        decks={c.categoryMembers}
                                        depth={depth + 1}
                                        id={`${id}-${i}`}
                                        openId={openId}
                                        toggleOpen={toggleOpen}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </AccordionActions>
            )}
        </Accordion>
    );
};

export default NestedMenuItem;
