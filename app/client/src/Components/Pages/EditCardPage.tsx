import React, { useReducer, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Card } from 'Models/Cards';
import {
    useAddCardMutation,
    useDeleteCardMutation,
    useFetchCardQuery,
    useUpdateCardMutation,
} from '../../api/ApolloClient';
import Editor from './../Editor';
import Image from './../Image';
import BackButton from './../BackButton';
import ChoiceInput from './../ChoiceInput';
import Paper from '@material-ui/core/Paper';
import Close from '@material-ui/icons/Close';
import LibraryAdd from '@material-ui/icons/LibraryAdd';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import { capitalize, get, mapValues, pick } from 'lodash';
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles';

interface EditCardPage {
    uploadToS3: (file: File, carId: string) => Promise<string>;
}

type ReducerState = Pick<Card, 'answer' | 'prompt' | 'imageKey' | 'handle' | 'choices' | 'details' | 'type'>;

const INITIAL_STATE: ReducerState = {
    answer: '',
    choices: undefined,
    details: undefined,
    handle: '',
    imageKey: '',
    prompt: '',
    type: 'standard',
};

const usePageStyles = makeStyles((theme) =>
    createStyles({
        CloseIcon: {
            color: theme.palette.warning.dark,
        },
    })
);

const EditCardPage: React.FC<EditCardPage> = ({ uploadToS3 }) => {
    const { cardId, deckId } = useParams(),
        { loading, refetch: refetchCard, data, error: fetchError } = useFetchCardQuery(cardId),
        theme = useTheme(),
        [error, setError] = useState<string>(),
        [state, dispatch] = useReducer(reducer, INITIAL_STATE),
        [_updateCard] = useUpdateCardMutation(),
        [deleteCard] = useDeleteCardMutation(),
        [createCard] = useAddCardMutation(),
        updateCard = (args: Partial<ReducerState> = {}) => {
            const card = { ...state, ...args };
            if (validateCard(card, setError)) {
                _updateCard({
                    variables: {
                        id: cardId,
                        deckId,
                        ...mapValues(card, (arg) => (arg === '' ? null : arg)),
                    },
                }).then(() => refetchCard());
            }
        },
        updateField = <T extends keyof ReducerState>(field: T) => (value: ReducerState[T]) =>
            dispatch({ type: 'update', payload: { [field]: value } }),
        history = useHistory(),
        classes = usePageStyles();

    useEffect(() => {
        if (get(data, 'card')) {
            dispatch({
                type: 'update',
                payload: pick(
                    mapValues(data.card, (v) => (v === null ? '' : v)),
                    'answer',
                    'prompt',
                    'imageKey',
                    'handle',
                    'choices',
                    'details',
                    'type'
                ),
            });
        }
    }, [get(data, 'card')]);

    useEffect(() => {
        if (get(state, 'choices.length') && state.answer && !state.choices.includes(state.answer)) {
            //check if there are choices but answer isn't a choice and remove answer
            updateField('answer')(state.choices[0]);
        }
        validateCard(state, setError);
    }, [state]);

    return (
        <Paper>
            {data && (
                <Box style={{ padding: theme.spacing(1) }}>
                    <Grid container spacing={2}>
                        <Grid item container xs={12} wrap="nowrap" md={6}>
                            <TextInput
                                error={!state.handle}
                                required
                                name="handle"
                                updateFn={updateField}
                                val={state.handle}
                            />
                            <Grid item>
                                <IconButton
                                    tabIndex={-1}
                                    className={classes.CloseIcon}
                                    onClick={() =>
                                        deleteCard({ variables: { id: cardId, deckId } }).then(() =>
                                            history.push(`/decks/${deckId}/edit`)
                                        )
                                    }
                                >
                                    <Close />
                                </IconButton>
                            </Grid>
                        </Grid>
                        <Grid item container xs={12} md={6}>
                            <TextInput textarea name="prompt" updateFn={updateField} val={state.prompt} />
                        </Grid>
                        <Grid item container direction="column" justify="center" alignItems="center" xs={12} md={6}>
                            {data.card.imageKey ? (
                                <>
                                    <Grid item style={{ padding: '5px' }}>
                                        <Image imgKey={data.card.imageKey} />
                                    </Grid>
                                    <Grid item>
                                        <label htmlFor="contained-button-file">
                                            <Button
                                                onClick={() => updateCard({ imageKey: null })}
                                                variant="contained"
                                                color="primary"
                                                component="span"
                                            >
                                                Remove Image
                                            </Button>
                                        </label>
                                    </Grid>
                                </>
                            ) : (
                                <>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="contained-button-file"
                                        type="file"
                                        onChange={async (e) => {
                                            const key = await uploadToS3(e.currentTarget.files[0], cardId);
                                            updateCard({ imageKey: key });
                                        }}
                                    />
                                    <label htmlFor="contained-button-file">
                                        <Button variant="contained" color="primary" component="span">
                                            Insert Image
                                        </Button>
                                    </label>
                                </>
                            )}
                        </Grid>
                        <Grid item container xs={12} md={6}>
                            {get(state, 'choices.length') ? (
                                <FormControl error={get(data.card, 'type') != 'quotation' && !state.answer} fullWidth>
                                    <InputLabel>Answer</InputLabel>
                                    <Select
                                        value={state.answer}
                                        onChange={(e) => updateField('answer')(e.target.value as string)}
                                    >
                                        {state.choices.map((choice) => (
                                            <MenuItem key={choice} value={choice}>
                                                {choice}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            ) : (
                                <TextInput
                                    error={!state.answer}
                                    name="answer"
                                    updateFn={updateField}
                                    val={state.answer}
                                />
                            )}
                        </Grid>
                        <Grid item container xs={12} md={6}>
                            <Editor
                                //initial content -- change will update parent but not controlled
                                initialContent={data.card.details}
                                onChange={updateField('details')}
                            />
                        </Grid>
                        <Grid item container xs={12} md={6}>
                            <ChoiceInput
                                choices={state.choices || []}
                                updateChoices={(choices) => updateField('choices')(choices)}
                            />
                        </Grid>
                        <Grid item container xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={state.type}
                                    onChange={(e) => updateField('type')(e.target.value as 'quotation')}
                                >
                                    {[
                                        { name: 'quotation', value: 'quotation' },
                                        { name: 'standard', value: 'standard' },
                                    ].map((choice) => (
                                        <MenuItem key={choice.name} value={choice.value}>
                                            {choice.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item>{error && <Typography color="error">{error}</Typography>}</Grid>
                    </Grid>
                    <Grid container wrap="nowrap" justify="space-between" spacing={2}>
                        <Grid item>
                            <Button disabled={!!error} variant="outlined" onClick={updateCard.bind(null, {})}>
                                Update
                            </Button>
                        </Grid>
                        <Grid item>
                            <BackButton />
                        </Grid>
                        <Grid item>
                            <IconButton
                                onClick={() =>
                                    createCard({ variables: { deckId, type: 'standard' } }).then((res) =>
                                        history.push(`/decks/${deckId}/cards/${res.data.addCard.id}/edit`)
                                    )
                                }
                            >
                                <LibraryAdd />
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <IconButton onClick={() => history.push(`/decks/${deckId}/cards/${cardId}`)}>
                                <LibraryBooks />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Paper>
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

export default EditCardPage;

const useTextInputStyles = makeStyles((theme) =>
    createStyles({
        root: {},
        FormControl: {
            flexGrow: 1,
        },
    })
);

const TextInput: React.FC<{
    error?: boolean;
    name: string;
    required?: boolean;
    textarea?: boolean;
    updateFn: (name: string) => (val: any) => void;
    val: string;
}> = ({ error, name, required, textarea, updateFn, val }) => {
    const classes = useTextInputStyles();
    return (
        <FormControl error={error} required={required} className={classes.FormControl}>
            <InputLabel>{capitalize(name)}</InputLabel>
            <Input
                onFocus={(e) => e.target.select()}
                onChange={(e) => updateFn(name)(e.currentTarget.value)}
                value={val}
                multiline={!!textarea}
            />
        </FormControl>
    );
};

const validateCard = (card: Partial<Card>, setError: (error: string) => void) => {
    let error: string;

    Object.entries(pick(card, 'prompt', 'handle')).forEach(([k, v]) => {
        if (!v) error = `${v} is required!`;
    });

    if (card.type === 'quotation' && card.choices.length) {
        error = 'Choices are not valid in quotation cards!';
    }

    if (card.type !== 'quotation' && !card.answer) {
        error = 'Answer is required!';
    }

    if (error) {
        setError(error);
        return false;
    } else {
        setError(undefined);
        return true;
    }
};
