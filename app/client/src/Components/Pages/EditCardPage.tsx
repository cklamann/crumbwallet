import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
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
import { loadingStateSelector } from './../../store/loadingReducer';
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
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import { get, mapValues, pick } from 'lodash';
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles';
import { useGoTo, useFormReducer } from 'Hooks';
import { TextInput } from 'Shared';

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
        [formState, updateField] = useFormReducer(INITIAL_STATE),
        [_updateCard] = useUpdateCardMutation(),
        [deleteCard] = useDeleteCardMutation(),
        [createCard] = useAddCardMutation(),
        goto = useGoTo(),
        updateCard = () => {
            _updateCard({
                variables: {
                    id: cardId,
                    deckId,
                    ...mapValues(formState, (arg): any => (arg === '' ? null : arg)),
                },
            })
                .then(() => refetchCard())
                .catch((e) => console.log(e));
        },
        classes = usePageStyles(),
        somethingIsLoading = !!useSelector(loadingStateSelector).loadingRequests.length;

    useEffect(() => {
        if (get(data, 'card')) {
            Object.entries(data.card).map(([k, v]: [keyof ReducerState, ReducerState[keyof ReducerState]]) => {
                if (Object.keys(INITIAL_STATE).includes(k) && formState[k] != v) {
                    updateField(k)(v);
                }
            });
        }
    }, [get(data, 'card')]);

    useEffect(() => {
        if (get(formState, 'choices.length') && formState.answer && !formState.choices.includes(formState.answer)) {
            //check if there are choices but answer isn't a choice and remove answer
            updateField('answer')(formState.choices[0]);
        }
        validateCard(formState, setError);
    }, [formState]);

    return (
        <Paper>
            {data && (
                <Box style={{ padding: theme.spacing(1) }}>
                    <Grid container spacing={2}>
                        <Grid item container xs={12} wrap="nowrap" md={6}>
                            <TextInput
                                error={!formState.handle}
                                required
                                name="handle"
                                updateFn={updateField}
                                val={formState.handle}
                            />
                            <Grid item>
                                <IconButton
                                    tabIndex={-1}
                                    className={classes.CloseIcon}
                                    onClick={() =>
                                        deleteCard({ variables: { id: cardId, deckId } }).then(() =>
                                            goto(`/decks/${deckId}/edit`)
                                        )
                                    }
                                >
                                    <Close />
                                </IconButton>
                            </Grid>
                        </Grid>
                        <Grid item container xs={12} md={6}>
                            <TextInput textarea name="prompt" updateFn={updateField} val={formState.prompt} />
                        </Grid>
                        <Grid item container direction="column" justify="center" alignItems="center" xs={12} md={6}>
                            {formState.imageKey ? (
                                <>
                                    <Grid item style={{ padding: '5px' }}>
                                        <Image imgKey={formState.imageKey} />
                                    </Grid>
                                    <Grid item>
                                        <label htmlFor="contained-button-file">
                                            <Button
                                                onClick={() => updateField('imageKey')(null)}
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
                                            updateField('imageKey')(key);
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
                            {formState.type != 'quotation' && (
                                <ChoiceInput
                                    choices={formState.choices || []}
                                    updateChoices={(choices) => updateField('choices')(choices)}
                                />
                            )}
                        </Grid>
                        <Grid item container xs={12} md={6} key={data.card.id}>
                            <Editor
                                //initial content -- change will update parent but state is internal
                                initialContent={data.card.details}
                                onChange={updateField('details')}
                            />
                            <Grid item container xs={12} md={6}>
                                {formState.type != 'quotation' && (
                                    <FormControl error={!formState.answer} fullWidth>
                                        <InputLabel>Answer</InputLabel>
                                        <Select
                                            value={formState.answer}
                                            onChange={(e) => updateField('answer')(e.target.value as string)}
                                        >
                                            {(formState.choices || [formState.answer]).map((choice) => (
                                                <MenuItem key={choice} value={choice}>
                                                    {choice}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Grid>
                        </Grid>
                        <Grid item container xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={formState.type}
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
                            <Button
                                disabled={!!error || !!somethingIsLoading}
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
                                    createCard({
                                        variables: {
                                            deckId,
                                            type: 'standard',
                                            answer: 'new answer',
                                            handle: 'newHandle',
                                            prompt: 'new prompt',
                                        },
                                    }).then((res) => goto(`/decks/${deckId}/cards/${res.data.addCard.id}/edit`))
                                }
                            >
                                <LibraryAdd />
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <IconButton onClick={() => goto(`/decks/${deckId}/cards/${cardId}`)}>
                                <LibraryBooks />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Paper>
    );
};

export default EditCardPage;

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
