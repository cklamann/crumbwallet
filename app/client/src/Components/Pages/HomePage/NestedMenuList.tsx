import React, { useState } from 'react';
import NestedMenuItem from './NestedMenuItem';
import { Deck } from 'Models/Decks';
import { Grid } from '@material-ui/core';

const NestedItemList: React.FC<{ decks: Deck[] }> = ({ decks }) => {
    const items = buildTree(decks),
        [openId, setOpenId] = useState<string>();

    return (
        <Grid container item xs={12} direction="column">
            {items.categoryChildren
                .sort((a, b) => (a.categoryName.toLowerCase() > b.categoryName.toLowerCase() ? 1 : -1))
                .map((c, i) => (
                    <NestedMenuItem
                        key={i}
                        categoryName={c.categoryName}
                        decks={c.categoryMembers}
                        childItems={c.categoryChildren}
                        depth={0}
                        openId={openId}
                        toggleOpen={(id: string) => (id === openId ? setOpenId(null) : setOpenId(id))}
                        id={String(i)}
                    />
                ))}
        </Grid>
    );
};

export interface CategoryTreeItem {
    categoryName: string;
    categoryMembers?: Deck[];
    categoryChildren?: CategoryTreeItem[];
}

export const buildTree = (decks: Deck[]) => {
    const tree = {} as CategoryTreeItem;
    tree.categoryName = 'root';
    tree.categoryChildren = [];

    decks.forEach((deck) => {
        if (!deck.category) {
            deck.category = '____';
        }
        addNestedMember(deck, tree);
    });

    return tree;
};

const addNestedMember = (deck: Deck, tree: CategoryTreeItem) => {
    const categories = deck.category.split('.');
    tree.categoryChildren = addCategory(categories, tree.categoryChildren);
    tree.categoryChildren = addMember(deck, deck.category.split('.'), tree.categoryChildren);
    return tree;
};

const addMember = (deck: Deck, categories: string[], categoryChildren: CategoryTreeItem[]) => {
    const target = categories[0],
        found = categoryChildren.find((c) => c.categoryName === target),
        nextCats = categories.slice(1);
    if (nextCats.length) {
        found.categoryChildren = addMember(deck, nextCats, found.categoryChildren);
    }

    if (!nextCats.length) {
        found.categoryMembers.push(deck);
    }

    return categoryChildren;
};

const addCategory = (categories: string[], categoryChildren: CategoryTreeItem[]) => {
    const target = categories[0];
    let found = categoryChildren.find((c) => c.categoryName === target);

    if (!found) {
        found = {
            categoryChildren: [],
            categoryMembers: [],
            categoryName: target,
        };
        categoryChildren.push(found);
    }

    const nextCats = categories.slice(1);

    if (nextCats.length) {
        found.categoryChildren = addCategory(nextCats, found.categoryChildren);
    }

    return categoryChildren;
};

export default NestedItemList;
