/// <reference types="jest" />

import { buildTree } from './../src/Components/Pages/HomePage/NestedMenuList';
import { Deck } from './../../server/models/Decks';

describe('#TREE BUILDER TEST', () => {
    it('should build the tree', (done) => {
        const deck: Deck = {
            category: 'foo.bar.baz',
            created: new Date(),
            cards: [],
            id: 'foo',
            name: 'bar',
            updated: new Date(),
        };

        const deck2: Deck = {
            category: 'foo.bar',
            created: new Date(),
            cards: [],
            id: 'foo',
            name: 'bar',
            updated: new Date(),
        };

        const tree = buildTree([deck, deck2]);
        expect(tree.categoryName).toEqual('root');
        const firstChildren = tree.categoryChildren;
        expect(firstChildren).toHaveLength(1);
        expect(firstChildren[0].categoryName).toEqual('foo');
        expect(firstChildren[0].categoryMembers).toHaveLength(0);
        const secondChildren = firstChildren[0].categoryChildren;
        expect(secondChildren).toHaveLength(1);
        expect(secondChildren).toHaveLength(1);
        expect(secondChildren[0].categoryName).toEqual('bar');
        expect(secondChildren[0].categoryMembers).toHaveLength(1);
        const thirdChildren = secondChildren[0].categoryChildren;
        expect(thirdChildren).toHaveLength(1);
        expect(thirdChildren[0].categoryName).toEqual('baz');
        expect(thirdChildren[0].categoryMembers).toHaveLength(1);
        expect(thirdChildren[0].categoryMembers[0].id).toEqual(deck.id);
        done();
    });
});
