import React, { useReducer, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from 'Models/Cards';
import { fetchCardQuery, updateCardMutation, useApolloMutation, useApolloQuery } from '../../api/ApolloClient';
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import { capitalize, get, isEqual, pick } from 'lodash';
import { withAuthenticator, S3Image } from 'aws-amplify-react';

interface EditCardPage {
    uploadToS3: (file: File) => Promise<string>;
}

type ReducerState = Pick<Card, 'answer' | 'prompt' | 'imageUrl' | 'handle' | 'options' | 'details'>;

const INITIAL_STATE: ReducerState = {
    answer: '',
    details: '',
    prompt: '',
    imageUrl: '',
    handle: '',
    options: null,
};

const EditCardPage: React.FC<EditCardPage> = ({ uploadToS3 }) => {
    const { cardId } = useParams(),
        { loading, refetch: refetchCard, data, error } = useApolloQuery<{ card: Card }>(fetchCardQuery, {
            variables: { _id: cardId },
        }),
        theme = useTheme(),
        [state, dispatch] = useReducer(reducer, INITIAL_STATE),
        [_updateCard] = useApolloMutation<{ card: { _id: string } }>(updateCardMutation),
        updateCard = (args: ReducerState = {}) =>
            _updateCard({ variables: { _id: get(data, 'card._id'), ...state, ...args } }),
        updateField = <T extends keyof ReducerState>(field: T) => (value: ReducerState[T]) =>
            dispatch({ type: 'update', payload: { [field]: value } }),
        inputRef = useRef();

    useEffect(() => {
        if (get(data, 'card')) {
            dispatch({
                type: 'update',
                payload: pick(get(data, 'card'), 'answer', 'prompt', 'imageUrl', 'handle', 'options', 'details'),
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
                            {data.card.imageUrl ? (
                                <S3Image imgKey={data.card.imageUrl} />
                            ) : (
                                <>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="contained-button-file"
                                        type="file"
                                        onChange={async e => {
                                            //setUpdating
                                            const key = await uploadToS3(e.currentTarget.files[0]);
                                            updateCard({ imageUrl: key });
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
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item>
                            <Button variant="outlined" onClick={updateCard}>
                                Update
                            </Button>
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
