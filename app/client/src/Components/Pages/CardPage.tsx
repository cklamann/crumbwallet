import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useFetchDeckQuery, useAddTryMutation } from './../../api/ApolloClient';
import Image from './../Image';
import { Card } from 'Models/Cards';
import CardComponent from '@material-ui/core/Card';
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
import ArrowLeft from '@material-ui/icons/ArrowLeft';
import Edit from '@material-ui/icons/Edit';
import ArrowRight from '@material-ui/icons/ArrowRight';
import Grid from '@material-ui/core/Grid';
import Slide from '@material-ui/core/Slide';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { findIndex, get, max, random, shuffle } from 'lodash';

interface CardPage {}

const useCardPageStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        },
        CardContent: {
            height: '310px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
        },
        CardActions: {
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: '400px',
            },
        },
        canGrow: {
            flexGrow: 1,
        },
        CardMedia: {
            [theme.breakpoints.down('md')]: {
                height: '300px',
            },
        },
        headerContent: {
            display: 'flex',
            alignItems: 'center',
        },
    })
);

const CardPage: React.FC<CardPage> = ({}) => {
    const history = useHistory(),
        { deckId, cardId } = useParams(),
        { loading, data } = useFetchDeckQuery(deckId),
        [_addTry] = useAddTryMutation(),
        [answer, setAnswer] = useState<string>(''),
        [answeredCorrectly, setAnsweredCorrectly] = useState<boolean>(),
        [answerModalOpen, setAnswerModalOpen] = useState<boolean>(),
        [imageLoaded, setImageLoaded] = useState<boolean>(false),
        [touchList, setTouchList] = useState<React.TouchList>(),
        [transitionInProgress, setTransitionInProgress] = useState(false),
        [transitionDirection, setTransitionDirection] = useState<string>('next'),
        classes = useCardPageStyles(),
        deck = get(data, 'deck'),
        card: Card = get(deck, 'cards', []).find((c) => c.id === cardId),
        finalizeAnswer = (answer: string) => {
            setAnswer(answer);
            setAnsweredCorrectly(answer == card.answer ? true : false);
            setAnswerModalOpen(true);
        },
        addTry = (correct: boolean) => _addTry({ variables: { cardId, correct } }),
        goToNextCard = () => {
            const idx = findIndex(deck.cards, (card) => card.id === cardId),
                target = idx < deck.cards.length - 1 ? idx + 1 : 0;
            resetCard();
            setTransitionDirection('next');
            setTransitionInProgress(true);
            history.push(`/decks/${deckId}/cards/${deck.cards[target].id}`);
        },
        goToPreviousCard = () => {
            const idx = findIndex(deck.cards, (card) => card.id === cardId),
                target = idx > 0 ? idx - 1 : deck.cards.length - 1;
            resetCard();
            setTransitionDirection('previous');
            setTransitionInProgress(true);
            history.push(`/decks/${deckId}/cards/${deck.cards[target].id}`);
        },
        resetCard = () => {
            setAnsweredCorrectly(undefined);
            setAnswer('');
            setAnswerModalOpen(false);
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
    //user could get her via the back button...
    useEffect(() => {
        if (!cardId && get(data, 'deck')) {
            if (!data.deck.cards.length) {
                history.push(`/`);
            } else history.push(`/decks/${deckId}/cards/${data.deck.cards[0].id}`);
        }
    });

    useEffect(() => {
        //reset image loaded state here...
        if (imageLoaded) {
            setImageLoaded(false);
        }
    }, [cardId]);

    const resolvePrompt = (card: Card) => {
        if (card.type !== 'quotation' || !card.type) {
            return <StandardPrompt content={card.prompt} />;
        } else return <QuotationPrompt quotation={card.prompt} onHint={() => setAnsweredCorrectly(false)} />;
    };
    return (
        <Slide
            mountOnEnter
            unmountOnExit
            onExited={() => setTransitionInProgress(false)}
            in={!!!transitionInProgress}
            direction={transitionDirection === 'previous' ? 'right' : 'left'}
            timeout={150}
        >
            <CardComponent className={classes.root} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                {!!card && !transitionInProgress && (
                    <>
                        <CardHeader
                            classes={{ content: classes.headerContent }}
                            title={`${deck.name} #${findIndex(deck.cards, (card) => card.id === cardId) + 1}`}
                            subheader={
                                <IconButton onClick={() => history.push(`/decks/${deckId}/cards/${cardId}/edit`)}>
                                    <Edit />
                                </IconButton>
                            }
                        />

                        <CardContent className={classes.CardContent}>
                            {!!card.imageKey && (
                                <CardMedia>
                                    <Image imgKey={card.imageKey} onLoad={() => setImageLoaded(true)} />
                                    {!imageLoaded && <span>Loading...</span>}
                                </CardMedia>
                            )}
                            <Grid container>
                                <Grid item xs={12}>
                                    {resolvePrompt(card)}
                                </Grid>
                            </Grid>
                        </CardContent>
                        <CardActions className={classes.CardActions}>
                            <Grid container justify="center">
                                {get(card, 'choices.length') ? (
                                    <Grid spacing={1} justify="center" container item xs={12}>
                                        {shuffle(card.choices).map((c) => (
                                            <Grid item key={c}>
                                                <Chip label={c} onClick={finalizeAnswer.bind(null, c)} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Grid container spacing={1} item xs={12} alignItems="center" wrap="nowrap">
                                        <Grid item className={classes.canGrow}>
                                            <TextField
                                                value={answer}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                    setAnswer(e.currentTarget.value)
                                                }
                                                label="answer"
                                            />
                                        </Grid>
                                        <Grid item>
                                            <Button onClick={finalizeAnswer.bind(null, answer)} variant="contained">
                                                Submit
                                            </Button>
                                        </Grid>
                                    </Grid>
                                )}
                                <Grid justify="space-between" container item>
                                    <IconButton onClick={goToPreviousCard}>
                                        <ArrowLeft />
                                    </IconButton>
                                    <IconButton onClick={goToNextCard}>
                                        <ArrowRight />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </CardActions>
                        {answerModalOpen && answeredCorrectly !== undefined && (
                            <Dialog
                                open={true}
                                onClose={() => {
                                    addTry(answeredCorrectly);
                                    resetCard();
                                }}
                            >
                                <DialogTitle>
                                    {answeredCorrectly === false ? (
                                        <Typography color="error">The correct answer was {card.answer}</Typography>
                                    ) : (
                                        <Typography>{card.answer} is correct</Typography>
                                    )}
                                </DialogTitle>
                                {card.details && (
                                    <DialogContent>
                                        <DialogContentText>
                                            <span dangerouslySetInnerHTML={{ __html: card.details }} />
                                        </DialogContentText>
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

export default CardPage;

const usePromptStyles = makeStyles((theme) =>
    createStyles({
        root: {},
        Line: {
            margin: '5px 0px',
        },
    })
);

const QuotationPrompt: React.FC<{ quotation: string; onHint: () => void }> = React.memo(({ quotation, onHint }) => {
    const lines = quotation.split('\n'),
        classes = usePromptStyles();
    if (lines.length > 1) {
        const blanked = random(0, lines.length - 1);
        return (
            <span>
                {lines.map((l, i) => {
                    if (i === blanked) {
                        return (
                            <p key={i} className={classes.Line}>
                                <BlankedOutSpace content={l} onClick={onHint} />
                            </p>
                        );
                    }
                    return <p key={i}>{l}</p>;
                })}
            </span>
        );
    }
    return <span>{quotation}</span>;
});

const StandardPrompt: React.FC<{ content: string }> = React.memo(({ content }) => {
    const lines = content.split('\n'),
        classes = usePromptStyles();
    if (lines.length > 1) {
        return (
            <span>
                {lines.map((l) => (
                    <p key={l}>{l}</p>
                ))}
            </span>
        );
    }
    return <span>{content}</span>;
});

const useBlankStyles = makeStyles((theme) =>
    createStyles({
        root: {},
        Blanked: {
            backgroundColor: theme.palette.primary.dark,
            cursor: 'pointer',
        },
    })
);

const BlankedOutSpace: React.FC<{ content: string; onClick: () => void }> = React.memo(({ content, onClick }) => {
    const [hidden, setHidden] = useState(true),
        classes = useBlankStyles();
    return (
        <span
            onClick={() => {
                onClick();
                setHidden(!hidden);
            }}
        >
            {hidden
                ? content.split('').map((_, i) => (
                      <span key={i} className={classes.Blanked}>
                          &nbsp;
                      </span>
                  ))
                : content}
        </span>
    );
});
