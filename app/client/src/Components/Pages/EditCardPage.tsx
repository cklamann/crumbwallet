import React, { useReducer, useEffect, useRef } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Card } from 'Models/Cards';
import { useDeleteCardMutation, useFetchCardQuery, useUpdateCardMutation } from '../../api/ApolloClient';
import Editor from './../Editor';
import BackButton from './../BackButton';
import ChoiceInput from './../ChoiceInput';
import Paper from '@material-ui/core/Paper';
import Close from '@material-ui/icons/Close';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import { capitalize, get, pick } from 'lodash';
import { withAuthenticator, S3Image } from 'aws-amplify-react';
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

const usePageStyles = makeStyles(theme =>
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
        updateCard = (args: Partial<ReducerState> = {}) =>
            _updateCard({ variables: { _id: get(data, 'card._id'), ...state, ...args } }).then(() => refetchCard()),
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

    return (
        <Paper>
            <span>{loading && <span>Loading!</span>}</span>

            {data && (
                <div style={{ padding: theme.spacing(1) }}>
                    <Grid container spacing={2}>
                        <Grid item container xs={12} md={6}>
                            <TextInput name="handle" updateFn={updateField} val={state.handle} />
                        </Grid>
                        <Grid item container xs={12} md={6}>
                            <Editor content={state.prompt} onChange={updateField('prompt')} />
                        </Grid>
                        <Grid item container xs={12} md={6}>
                            {data.card.imageKey ? (
                                <>
                                    <S3Image
                                        theme={{
                                            photoImg: {
                                                width: '100%',
                                                objectFit: 'cover',
                                            },
                                        }}
                                        imgKey={data.card.imageKey}
                                    />
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
                                </>
                            ) : (
                                <>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="contained-button-file"
                                        type="file"
                                        onChange={async e => {
                                            //setUpdating
                                            const key = await uploadToS3(e.currentTarget.files[0], cardId);
                                            updateCard({ imageKey: key });
                                            //setnot updating
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
                            <TextInput name="answer" updateFn={updateField} val={state.answer} />
                        </Grid>
                        <Grid item container xs={12} md={6}>
                            <TextInput textarea name="details" updateFn={updateField} val={state.details} />
                        </Grid>
                        <Grid item container xs={12} md={6}>
                            <ChoiceInput
                                choices={data.card.choices || []}
                                updateChoices={choices => updateCard({ choices })}
                            />
                        </Grid>
                    </Grid>
                    <Grid container justify="space-between" spacing={2}>
                        <Grid item>
                            <Button variant="outlined" onClick={updateCard.bind(null, {})}>
                                Update
                            </Button>
                        </Grid>
                        <BackButton />
                        <Grid item>
                            <IconButton
                                className={classes.CloseIcon}
                                onClick={() =>
                                    deleteCard({ variables: { _id: cardId } }).then(() =>
                                        history.push(`/decks/${deckId}/edit`)
                                    )
                                }
                            >
                                <Close />
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

export default withAuthenticator(EditCardPage);

const useTextInputStyles = makeStyles(theme =>
    createStyles({
        root: {},
        FormControl: {
            flexGrow: 1,
        },
    })
);

const TextInput: React.FC<{
    name: string;
    updateFn: (name: string) => (val: any) => void;
    val: string;
    textarea?: boolean;
}> = ({ name, updateFn, textarea, val }) => {
    const classes = useTextInputStyles();
    return (
        <FormControl className={classes.FormControl}>
            <InputLabel>{capitalize(name)}</InputLabel>
            <Input onChange={e => updateFn(name)(e.currentTarget.value)} value={val} multiline={!!textarea} />
        </FormControl>
    );
};
