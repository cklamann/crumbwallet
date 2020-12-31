import React, { useContext, useReducer } from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import { useAddCardMutation, useAddDeckMutation, useCreateChessDiagramPngUrlMutation } from '../../../api/ApolloClient';
import { UserContext } from '../../App';
import { useGoTo } from 'Hooks';
import { FullWidthTextField } from 'Shared';
import * as Chess from 'chess.js';

interface ReducerState {
    categories: string[];
    chess: boolean;
    name: string;
    pgn: string;
    fen: string;
    private: boolean;
}

const INITIAL_STATE: ReducerState = {
    categories: undefined,
    chess: false,
    name: '',
    pgn: '',
    fen: '',
    private: false,
};

const NewDeckForm: React.FC<{}> = ({}) => {
    const [addDeck] = useAddDeckMutation(),
        [addCard] = useAddCardMutation(),
        [generateImage] = useCreateChessDiagramPngUrlMutation(),
        [state, dispatch] = useReducer(reducer, INITIAL_STATE),
        userId = useContext(UserContext),
        goto = useGoTo(),
        updateField = <T extends keyof ReducerState>(field: T) => (value: ReducerState[T]) =>
            dispatch({ type: 'update', payload: { [field]: value } }),
        composeBuildDiagramFn = (deckId: string) => (fen: string, side: 'w' | 'b', turn: number, nextMove: string) =>
            generateImage({ variables: { fen, savePath: `${turn}${side}${deckId}` } }).then((res) =>
                addCard({
                    variables: {
                        deckId,
                        handle: `${turn}${side}`,
                        imageKey: res.data.createChessDiagram.key,
                        answer: nextMove,
                        choices: [nextMove],
                        prompt: `${side === 'b' ? 'Black' : 'White'} to move`,
                    },
                })
            );

    //todo: clean this up
    const createDeck = () =>
        addDeck({
            variables: { name: state.name, userId, private: state.private, type: state.chess ? 'chess' : null },
        })
            .then((res) => res.data.createDeck.id)
            .then((deckId) => {
                if (state.chess) {
                    return Promise.all(buildDiagram(state.pgn, composeBuildDiagramFn(deckId), state.fen)).then(
                        () => deckId
                    );
                } else return deckId;
            })
            .then((deckId) => goto(`/decks/${deckId}/edit`))
            .catch((err) => console.error(err));

    return (
        <Grid container wrap="wrap" alignItems="center">
            <Grid item xs={12} md={6}>
                <FullWidthTextField
                    value={state.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('name')(e.currentTarget.value)}
                    required
                    label="Name"
                />
            </Grid>
            <Grid item xs={6} md={2}>
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
            </Grid>
            <Grid item xs={6} md={2}>
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
            </Grid>
            {state.chess && (
                <>
                    <Grid item xs={10}>
                        <FullWidthTextField
                            value={state.fen}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                updateField('fen')(e.currentTarget.value)
                            }
                            label="FEN"
                        />
                    </Grid>
                    <Grid item xs={10}>
                        <FullWidthTextField
                            value={state.pgn}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                updateField('pgn')(e.currentTarget.value)
                            }
                            required={state.chess}
                            label="PGN"
                        />
                    </Grid>
                </>
            )}
            <Grid item xs={2}>
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
    create: (fen: string, side: 'w' | 'b', turn: number, nextMove: string) => Promise<any>,
    fen?: string
) => {
    
    validatePgn(pgn, !!fen);

    const moves = pgn
        .replace(/\[.+\]/, '')
        .replace(/\{\.+\}/g, '')
        .replace(/\.\.\./, '')
        .replace(/\d+\./g, ' ')
        .split(' ')
        .map((mv) => mv.trim())
        .filter((mv) => /^\w/.test(mv));

    if (!moves.length) throw invalidPgn('No moves detected in pgn!');

    //remove score if exists
    moves[moves.length - 1].replace(/ \d.+/, '');

    //@ts-ignore
    const chess = Chess();

    if (fen) {
        loadFen(chess, fen);
    }

    const fens = [];

    fens.push(chess.fen());

    moves.forEach((m, i) => {
        if (chess.move(m) === null) {
            throw invalidPgn(`${m} is not allowed!`);
        }
        if (i !== moves.length - 1) {
            fens.push(chess.fen());
        }
    });
    return fens.map((f, i) => create(f, f.split(' ')[1], +f.split(' ')[5], moves[i]));
};

const validatePgn = (pgn: string, hasFen: boolean) => {
    if (!pgn.trim().startsWith('1.') && !hasFen) {
        throw invalidPgn('PGN with no FEN must start with move 1!');
    }
    return true;
};

const INVALID_PGN = 'INVALID_PGN',
    INVALID_FEN = 'INVALID_FEN';

const invalidPgn = (message: string) => ({
    message,
    type: INVALID_PGN,
});

const invalidFen = (message: string) => ({
    message,
    type: INVALID_FEN,
});

const loadFen = (chessInstance: any, fen: string) => {
    const validated = chessInstance.validate_fen(fen);
    if (!validated.valid) {
        throw invalidFen(validated.error);
    }
    return chessInstance.load(fen);
};
