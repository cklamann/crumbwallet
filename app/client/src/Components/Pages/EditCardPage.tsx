import React, { useReducer, useEffect } from 'react';
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
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import { capitalize, get, pick } from 'lodash';
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles';

interface EditCardPage {
    uploadToS3: (file: File, carId: string) => Promise<string>;
}

type ReducerState = Pick<Card, 'answer' | 'prompt' | 'imageKey' | 'handle' | 'choices' | 'details'>;

const INITIAL_STATE: ReducerState = {
    answer: '',
    details: '',
    prompt: undefined,
    imageKey: '',
    handle: '',
    choices: undefined,
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
        { loading, refetch: refetchCard, data, error } = useFetchCardQuery(cardId),
        theme = useTheme(),
        [state, dispatch] = useReducer(reducer, INITIAL_STATE),
        [_updateCard] = useUpdateCardMutation(),
        [deleteCard] = useDeleteCardMutation(),
        [createCard] = useAddCardMutation(),
        updateCard = (args: Partial<ReducerState> = {}) =>
            _updateCard({ variables: { id: cardId, deckId, ...state, ...args } }).then(() => refetchCard()),
        updateField = <T extends keyof ReducerState>(field: T) => (value: ReducerState[T]) =>
            dispatch({ type: 'update', payload: { [field]: value } }),
        history = useHistory(),
        classes = usePageStyles();

    useEffect(() => {
        if (get(data, 'card')) {
            dispatch({
                type: 'update',
                payload: pick(get(data, 'card'), 'answer', 'prompt', 'imageKey', 'handle', 'choices', 'details'),
            });
        }
    }, [get(data, 'card')]);

    useEffect(() => {
        if (get(state, 'choices.length') && state.answer && !state.choices.includes(state.answer)) {
            //check if there are choices but answer isn't a choice and remove answer
            updateField('answer')('');
        }
    }, [state]);

    return (
        <Paper>
            <span>{loading && <span>Loading!</span>}</span>

            {data && (
                <div style={{ padding: theme.spacing(1) }}>
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
                                        deleteCard({ variables: { id: cardId } }).then(() =>
                                            history.push(`/decks/${deckId}/edit`)
                                        )
                                    }
                                >
                                    <Close />
                                </IconButton>
                            </Grid>
                        </Grid>
                        <Grid item container xs={12} md={6}>
                            <Editor content={state.prompt} onChange={updateField('prompt')} />
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
                                                onClick={() => updateCard({ imageKey: '' })}
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
                                <FormControl error={!state.answer} fullWidth>
                                    <InputLabel>Answer</InputLabel>
                                    <Select
                                        value={state.answer}
                                        onChange={(e) => updateField('answer')(e.target.value)}
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
                            <TextInput textarea name="details" updateFn={updateField} val={state.details} />
                        </Grid>
                        <Grid item container xs={12} md={6}>
                            <ChoiceInput
                                choices={data.card.choices || []}
                                updateChoices={(choices) => updateCard({ choices })}
                            />
                        </Grid>
                    </Grid>
                    <Grid container wrap="nowrap" justify="space-between" spacing={2}>
                        <Grid item>
                            <Button
                                disabled={!state.answer || !state.prompt || !state.handle}
                                variant="outlined"
                                onClick={updateCard.bind(null, {})}
                            >
                                Update
                            </Button>
                        </Grid>
                        <Grid item>
                            <BackButton />
                        </Grid>
                        <Grid item>
                            <IconButton
                                onClick={() =>
                                    createCard({ variables: { deckId } }).then((res) =>
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
                </div>
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
