import React, { useContext, useReducer, useState } from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import { useAddCardMutation, useAddDeckMutation, useCreateChessDiagramPngUrlMutation } from '../../../api/ApolloClient';
import { UserContext } from '../../App';
import { useFormReducer, useGoTo } from 'Hooks';
import { FullWidthTextField } from 'Shared';
import * as Chess from 'chess.js';
import { Typography } from '@material-ui/core';

interface ReducerState {
    category: string;
    type: string;
    name: string;
    pgn: string;
    fen: string;
    private: boolean;
}

const INITIAL_STATE: ReducerState = {
    category: '',
    type: '',
    name: '',
    pgn: '',
    fen: '',
    private: false,
};

const NewDeckForm: React.FC<{}> = ({}) => {
    const [_addDeck] = useAddDeckMutation(),
        [addCard] = useAddCardMutation(),
        [generateImage] = useCreateChessDiagramPngUrlMutation(),
        [formState, updateField] = useFormReducer(INITIAL_STATE),
        [fenError, setFenError] = useState<string>(),
        [pgnError, setPgnError] = useState<string>(),
        userId = useContext(UserContext),
        goto = useGoTo(),
        getSubmitDisabled = () => {
            const { type, name, pgn } = formState;
            if (!!name) {
                if (type != 'chess') return false;
                if (pgn) return false;
            }
            return true;
        },
        addDeck = () => {
            const { pgn, fen, ...deck } = formState;
            return _addDeck({ variables: { ...deck, userId } }).then(
                ({
                    data: {
                        createDeck: { id },
                    },
                }) => id
            );
        },
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
            ),
        createChessDeck = () => {
            const { fen, pgn } = formState;
            try {
                validateChessDeck(pgn, fen);
            } catch (e) {
                return setChessErrors(e);
            }
            setPgnError(null);
            setFenError(null);

            addDeck()
                .then((id) =>
                    Promise.all(buildDiagram(formState.pgn, composeBuildDiagramFn(id), formState.fen))
                        .then(() => id)
                        .catch((e) => console.log(`caught: ${e}`))
                )
                .then((deckId) => goto(`/decks/${deckId}/edit`))
                .catch((err) => console.error(err));
        },
        createDeck = () =>
            addDeck()
                .then((id) => goto(`/decks/${id}/edit`))
                .catch((err) => console.error(err)),
        setChessErrors = (e: ChessError) => {
            switch (e.type) {
                case INVALID_PGN:
                    return setPgnError(e.message);
                case INVALID_FEN:
                    return setFenError(e.message);
                default:
                    console.error(e);
                    return;
            }
        };

    return (
        <Grid container wrap="wrap" spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
                <FullWidthTextField
                    value={formState.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateField('name')(e.currentTarget.value)}
                    required
                    label="Name"
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <FullWidthTextField
                    value={formState.category}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateField('category')(e.currentTarget.value)
                    }
                    required
                    label="Category"
                />
            </Grid>
            <Grid item xs={6} md={2}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formState.private}
                            onChange={() => updateField('private')(!formState.private)}
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
                            checked={formState.type === 'chess'}
                            onChange={() => updateField('type')(formState.type === 'chess' ? null : 'chess')}
                            color="primary"
                        />
                    }
                    label="Chess?"
                />
            </Grid>
            {formState.type === 'chess' && (
                <>
                    <Grid item xs={10}>
                        <FullWidthTextField
                            value={formState.fen}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                updateField('fen')(e.currentTarget.value)
                            }
                            error={!!fenError}
                            label="FEN"
                        />
                        {fenError && <Typography color="error">{fenError}</Typography>}
                    </Grid>
                    <Grid item xs={10}>
                        <FullWidthTextField
                            value={formState.pgn}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                updateField('pgn')(e.currentTarget.value)
                            }
                            error={!!pgnError}
                            required={formState.type === 'chess'}
                            label="PGN"
                        />
                        {pgnError && <Typography color="error">{pgnError}</Typography>}
                    </Grid>
                </>
            )}
            <Grid container item xs={12}>
                <Button
                    disabled={getSubmitDisabled()}
                    onClick={() => (formState.type === 'chess' ? createChessDeck() : createDeck())}
                    variant="contained"
                >
                    Go
                </Button>
            </Grid>
        </Grid>
    );
};

export default NewDeckForm;

const validateChessDeck = (pgn: string, fen?: string) => {
    //@ts-ignore
    const instance = Chess();
    if (fen) {
        const validatedFen = instance.validate_fen(fen);
        if (!validatedFen.valid) {
            throw invalidFen(validatedFen.error);
        }
        instance.load(fen);
    }
    const moves = getMovesFromPgn(pgn);

    moves.forEach((m, i) => {
        if (instance.move(m) === null) {
            throw invalidPgn(`${m} is not allowed!`);
        }
    });

    return true;
};

const getMovesFromPgn = (pgn: string) => {
    const moves = pgn
        .replace(/\[.+\]/, '')
        .replace(/\{\.+\}/g, '')
        .replace(/\.\.\./, '')
        .replace(/\d+\./g, ' ')
        .split(' ')
        .map((mv) => mv.trim())
        .filter((mv) => /^\w/.test(mv));

    if (!moves.length) throw invalidPgn('No moves in pgn!');

    return moves;
};

const buildDiagram = (
    pgn: string,
    create: (fen: string, side: 'w' | 'b', turn: number, nextMove: string) => Promise<any>,
    fen?: string
) => {
    const moves = getMovesFromPgn(pgn);
    //remove score if exists
    moves[moves.length - 1].replace(/ \d.+/, '');

    //@ts-ignore
    const chess = Chess();

    if (fen) {
        chess.load(fen);
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

const INVALID_PGN = 'INVALID_PGN',
    INVALID_FEN = 'INVALID_FEN';

interface ChessError {
    message: string;
    type: string;
}

const invalidPgn = (message: string) => ({
    message,
    type: INVALID_PGN,
});

const invalidFen = (message: string) => ({
    message,
    type: INVALID_FEN,
});
