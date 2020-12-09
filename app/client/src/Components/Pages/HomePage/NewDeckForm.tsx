import React, { useContext, useReducer, useState } from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { useHistory } from 'react-router-dom';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { useAddCardMutation, useAddDeckMutation, useCreateChessDiagramPngUrlMutation } from '../../../api/ApolloClient';
import { UserContext } from '../../App';

const useNewDeckFormStyles = makeStyles((theme) =>
    createStyles({
        root: {
            flexWrap: 'nowrap',
        },
    })
);

interface ReducerState {
    categories: string[];
    chess: boolean;
    name: string;
    pgn: string;
    private: boolean;
}

const INITIAL_STATE: ReducerState = {
    categories: undefined,
    chess: false,
    name: '',
    pgn: '',
    private: false,
};

const NewDeckForm: React.FC<{}> = ({}) => {
    const [addDeck] = useAddDeckMutation(),
        [addCard] = useAddCardMutation(),
        [generateImage] = useCreateChessDiagramPngUrlMutation(),
        [state, dispatch] = useReducer(reducer, INITIAL_STATE),
        userId = useContext(UserContext),
        classes = useNewDeckFormStyles(),
        history = useHistory(),
        updateField = <T extends keyof ReducerState>(field: T) => (value: ReducerState[T]) =>
            dispatch({ type: 'update', payload: { [field]: value } });

    const createDeck = () =>
        addDeck({
            variables: { name: state.name, userId, private: state.private, type: state.chess ? 'chess' : null },
        })
            .then((res) => res.data.createDeck.id)
            .then((deckId) => {
                const build = (pgn: string, side: 'w' | 'b', turn: number, nextMove: string) =>
                    generateImage({ variables: { pgn, savePath: `${turn}${side}${deckId}` } }).then((res) =>
                        addCard({
                            variables: {
                                deckId,
                                handle: `${turn}${side}`,
                                imageKey: res.data.createChessDiagram.key,
                                answer: nextMove,
                                choices: [nextMove],
                                prompt: `${side === 'w' ? 'Black' : 'White'} to move`,
                            },
                        })
                    );
                const promises =
                    state.chess && !!state.pgn ? buildDiagram(state.pgn, build) : [new Promise((res) => res('foo'))];
                return Promise.all(promises)
                    .then(() => history.push(`decks/${deckId}/edit`))
                    .catch((err) => console.log(err));
            });

    return (
        <Grid container className={classes.root}>
            <Grid item>
                <TextField
                    value={state.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('name')(e.currentTarget.value)}
                    required
                    label="Name"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.private}
                            onChange={() => updateField('private')(!state.private)}
                            color="primary"
                        />
                    }
                    label="Private?"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.chess}
                            onChange={() => updateField('chess')(!state.chess)}
                            color="primary"
                        />
                    }
                    label="Chess?"
                />
                {state.chess && (
                    <TextField
                        value={state.pgn}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('pgn')(e.currentTarget.value)}
                        required={state.chess}
                        label="PGN"
                    />
                )}
            </Grid>
            <Grid item>
                <Button
                    disabled={!state.name || (state.chess && !state.pgn)}
                    onClick={() => createDeck()}
                    variant="contained"
                >
                    Go
                </Button>
            </Grid>
        </Grid>
    );
};

const reducer = (state: ReducerState, action: { type: string; payload: Partial<ReducerState> }) => {
    switch (action.type) {
        case 'update':
            return { ...state, ...action.payload };
        default:
            return state;
    }
};

export default NewDeckForm;

const buildDiagram = (
    pgn: string,
    create: (pgn: string, side: 'w' | 'b', turn: number, nextMove: string) => Promise<any>
) => {
    const moves = pgn
        //remove headers
        //todo: save FEN
        //here's the example:
        /* 
            const foo = chess.load_pgn(`[SetUp "1"]
            [FEN "r1bk2r1/pppp1pBp/8/b2P4/2B4q/6Q1/P4PP1/R3R1K1 b - - 4 17"]

            17... Qe7 18. Rxe7`
            );
        */
       //has to be like this, with the setup just like this and a blank line
       //and everything justified to the left hand side (no leading spaces)
       //best thing is likely to give user optional positional FEN and compile before upload
       //validate with chess.js before every call
        .replace(/\[.+\]/, '')
        .split(/\d+\./)
        .map((mv) => mv.trim())
        .filter((mv) => /^\w/.test(mv));

    if (!moves.length) throw 'No moves detected in pgn!';

    //remove score if exists
    moves[moves.length - 1].replace(/ \d.+/, '');

    let game = '';
    const promises: Promise<any>[] = [];
    for (let i = 0; i < moves.length; i++) {
        const turn = moves[i];
        //not working --> can steal regex or load_pgn from chess.js?
        //yeah pgn() method will get us back a pgn from a pgn... but what's the point?
        turn.replace(/\{\.+\}/, '');
        const [w, b] = turn.split(' ');

        if (!b) continue;

        game = `${game} ${i + 1}. ${w}`;

        promises.push(create(game, 'w', i + 1, b));

        const nextMove = moves[i + 1];

        if (nextMove) {
            game = `${game} ${b}`;
            promises.push(create(game, 'b', i + 1, nextMove.split(' ')[0]));
        }
    }
    return promises;
};
