import React from 'react';
import NestedMenuItem from './NestedMenuItem';
import { Deck } from 'Models/Decks';
import { Grid } from '@material-ui/core';

const NestedItemList: React.FC<{ decks: Deck[] }> = ({ decks }) => {
    const items = buildTree(decks);
    return (
        <Grid>
            {items.categoryChildren.map((c) => (
                <NestedMenuItem
                    categoryName={c.categoryName}
                    decks={c.categoryMembers}
                    childItems={c.categoryChildren}
                    depth={0}
                    open={false}
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
            tree.categoryChildren.push({
                categoryName: deck.name,
                categoryMembers: [deck],
            });
            return;
        } else {
            addNestedMember(deck, tree);
        }
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

    found.categoryMembers.push(deck);
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
