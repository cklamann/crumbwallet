import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useFetchDeckQuery, useAddTryMutation } from './../../api/ApolloClient';
import { Card } from 'Models/Cards';
import CardComponent from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';
import Slide from '@material-ui/core/Slide';

import { findIndex, get } from 'lodash';
import { withAuthenticator, S3Image } from 'aws-amplify-react';

interface CardPage {}

//todo: swipe transitions

const CardPage: React.FC<CardPage> = ({}) => {
    const history = useHistory(),
        { deckId, cardId } = useParams(),
        { loading, data } = useFetchDeckQuery(deckId),
        [_addTry] = useAddTryMutation(),
        [answer, setAnswer] = useState<string>(''),
        [answeredCorrectly, setAnsweredCorrectly] = useState<boolean>(),
        [imageLoaded, setImageLoaded] = useState<boolean>(false),
        [touchList, setTouchList] = useState<React.TouchList>(),
        [transitionInProgress, setTransitionInProgress] = useState(false),
        [transitionDirection, setTransitionDirection] = useState<string>('next'),
        deck = get(data, 'deck'),
        card: Card = get(deck, 'cards', []).find(c => c._id === cardId),
        submitAnswer = (answer: string) => {
            setAnswer(answer);
            setAnsweredCorrectly(answer == card.answer ? true : false);
        },
        addTry = (correct: boolean) => _addTry({ variables: { deckId: deckId, correct } }),
        goToNextCard = () => {
            const idx = findIndex(deck.cards, card => card._id === cardId),
                target = idx < deck.cards.length - 1 ? idx + 1 : 0;
            resetCard();
            setTransitionDirection('next');
            setTransitionInProgress(true);
            history.push(`/decks/${deckId}/cards/${deck.cards[target]._id}`);
        },
        goToPreviousCard = () => {
            const idx = findIndex(deck.cards, card => card._id === cardId),
                target = idx > 0 ? idx - 1 : deck.cards.length - 1;
            resetCard();
            setTransitionDirection('previous');
            setTransitionInProgress(true);
            history.push(`/decks/${deckId}/cards/${deck.cards[target]._id}`);
        },
        resetCard = () => {
            setAnsweredCorrectly(undefined);
            setAnswer('');
        },
        handleTouchStart = (e: React.TouchEvent<any>) => setTouchList(e.changedTouches),
        handleTouchEnd = (e: React.TouchEvent<any>) => {
            if (get(touchList, 'length')) {
                const touch1 = touchList[0],
                    touch2 = e.changedTouches[0];
                if (touch1.clientX - touch2.clientX > 100) {
                    if (answeredCorrectly) {
                        addTry(answeredCorrectly);
                    }
                    goToNextCard();
                } else if (touch2.clientX - touch1.clientX > 100) {
                    if (answeredCorrectly) {
                        addTry(answeredCorrectly);
                    }
                    goToPreviousCard();
                }

                setTouchList(undefined);
            }
        };
    useEffect(() => {
        if (get(data, 'deck') && !cardId) {
            history.push(`/decks/${deckId}/cards/${data.deck.cards[0]._id}`);
        }
    }, [data]);

    useEffect(() => {
        //reset image loaded state here
        if (imageLoaded) {
            setImageLoaded(false);
        }
    }, [cardId]);

    return (
        <Slide
            mountOnEnter
            unmountOnExit
            onExited={() => setTransitionInProgress(false)}
            in={!!!transitionInProgress}
            direction={transitionDirection === 'previous' ? 'right' : 'left'}
            timeout={250}
        >
            <CardComponent onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                {!!card && !transitionInProgress && (
                    <>
                        <CardHeader title={card.handle} />
                        {!!card.imageKey && (
                            <CardMedia>
                                <S3Image
                                    imgKey={card.imageKey}
                                    theme={{
                                        photoImg: {
                                            width: '100%',
                                            objectFit: 'cover',
                                        },
                                    }}
                                    onLoad={() => setImageLoaded(true)}
                                />
                                {!imageLoaded && <span>Loading...</span>}
                            </CardMedia>
                        )}
                        <CardContent>
                            <Box>
                                <Grid container>
                                    <Grid item xs={12}>
                                        <span dangerouslySetInnerHTML={{ __html: card.prompt }} />
                                    </Grid>
                                </Grid>
                            </Box>
                        </CardContent>
                        <CardActions>
                            <Grid spacing={1} container>
                                {get(card, 'choices.length') ? (
                                    card.choices.map(c => (
                                        <Grid item key={c}>
                                            <Chip label={c} onClick={submitAnswer.bind(null, c)} />
                                        </Grid>
                                    ))
                                ) : (
                                    <>
                                        <Grid item>
                                            <TextField
                                                value={answer}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    setAnswer(e.currentTarget.value)
                                                }
                                                label="answer"
                                            />
                                        </Grid>
                                        <Grid item>
                                            <Button onClick={submitAnswer.bind(null, answer)} variant="contained">
                                                Submit
                                            </Button>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </CardActions>
                        {answeredCorrectly !== undefined && (
                            <Dialog
                                open={true}
                                onClose={() => {
                                    goToNextCard();
                                }}
                            >
                                <DialogTitle>
                                    {answeredCorrectly === false ? (
                                        <Typography color="error">The correct anser was {card.answer}</Typography>
                                    ) : (
                                        <Typography>{card.answer} is correct</Typography>
                                    )}
                                </DialogTitle>
                                {card.details && (
                                    <DialogContent>
                                        <DialogContentText>{card.details}</DialogContentText>
                                    </DialogContent>
                                )}
                            </Dialog>
                        )}
                    </>
                )}
            </CardComponent>
        </Slide>
    );
};
//down here should have controls --> go to beginning, redo, shuffle, back

export default CardPage;
