import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useFetchDeckQuery, useAddTryMutation } from './../../api/ApolloClient';
import Image from './../Image';
import { Card } from 'Models/Cards';
import { Deck } from 'Models/Decks';
import CardComponent from '@material-ui/core/Card';
import Chip from '@material-ui/core/Chip';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FAB from '@material-ui/core/Fab';
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
import Check from '@material-ui/icons/Check';
import Edit from '@material-ui/icons/Edit';
import ArrowRight from '@material-ui/icons/ArrowRight';
import Grid from '@material-ui/core/Grid';
import Slide from '@material-ui/core/Slide';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { findIndex, get, random, shuffle } from 'lodash';

interface CardPage {}

const useCardPageStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '450px',
        },
        CardContent: {
            height: '350px',
            maxWidth: '400px',
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
        [deck, setDeck] = useState<Deck>(),
        [answeredCorrectly, setAnsweredCorrectly] = useState<boolean>(undefined),
        [answerModalOpen, setAnswerModalOpen] = useState<boolean>(),
        [imageLoaded, setImageLoaded] = useState<boolean>(false),
        [touchList, setTouchList] = useState<React.TouchList>(),
        [transitionInProgress, setTransitionInProgress] = useState(false),
        [transitionDirection, setTransitionDirection] = useState<string>('next'),
        classes = useCardPageStyles(),
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
                    if (typeof answeredCorrectly !== 'undefined') {
                        addTry(answeredCorrectly);
                    }
                    goToNextCard();
                } else if (touch2.clientX - touch1.clientX > 100) {
                    if (typeof answeredCorrectly !== 'undefined') {
                        addTry(answeredCorrectly);
                    }
                    goToPreviousCard();
                }

                setTouchList(undefined);
            }
        },
        setAnswerWrong = () => setAnsweredCorrectly(false);

    //we want to fetch the deck once and hold it, so we can shuffle, sort,

    //user could get her via the back button...
    useEffect(() => {
        if (get(data, 'deck')) {
            if (data.deck.cards) {
                const { deck } = data,
                    shuffled = shuffle(data.deck.cards);
                deck.cards = shuffled;
                setDeck(data.deck);
            } else {
                //todo: show modal and redirect
                history.push(`/`);
            }
        }
    }, [data]);

    useEffect(() => {
        if (deck && get(deck, 'cards.length')) {
            history.push(`/decks/${deckId}/cards/${deck.cards[0].id}`);
        }
    }, [deck]);

    useEffect(() => {
        //reset image loaded state here...
        if (imageLoaded) {
            setImageLoaded(false);
        }
    }, [cardId]);

    const resolvePrompt = useMemo(() => {
        if (!card) return () => <span />;
        if (get(card, 'type') !== 'quotation' || !get(card, 'type')) {
            return () => <StandardPrompt content={card.prompt} />;
        } else return () => <QuotationPrompt quotation={card.prompt} onHint={setAnswerWrong} />;
    }, [card]);

    const resolveAnswerComponent = useMemo(() => {
        if (!card) return () => <span />;
        if (get(card, 'type') === 'quotation') {
            return () => (
                <MarkCorrectButton
                    markCorrect={() => {
                        setAnsweredCorrectly(true);
                        setAnswerModalOpen(true);
                    }}
                />
            );
        }
        if (get(card, 'choices.length'))
            return () => <ChoicesAnswer choices={card.choices} finalizeAnswer={finalizeAnswer} />;
        return () => <StandardAnswer answer={card.answer} setAnswer={setAnswer} finalizeAnswer={finalizeAnswer} />;
    }, [card]);

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
                                    {resolvePrompt()}
                                </Grid>
                            </Grid>
                        </CardContent>
                        {/* todo: these need to be broken into separate components */}
                        <CardActions className={classes.CardActions}>
                            <Grid container justify="center">
                                {resolveAnswerComponent()}
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
                                        <Typography>
                                            {card.answer ? `${card.answer} is correct` : `Nice work!`}
                                        </Typography>
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
    } else {
        const words = lines[0].split(' '),
            filtered = words.filter((w) => !stopWords.includes(w.toLowerCase())),
            toBlank = filtered[random(0, filtered.length - 1)];

        return (
            <span>
                {words.map((w, i) =>
                    w === toBlank ? (
                        <span key={i}>
                            &nbsp;
                            <BlankedOutSpace content={w} onClick={onHint} />
                        </span>
                    ) : (
                        <span key={i}>&nbsp;{w}</span>
                    )
                )}
            </span>
        );
    }
});

const StandardPrompt: React.FC<{ content: string }> = React.memo(({ content }) => {
    const lines = content.split('\n'),
        classes = usePromptStyles();
    if (lines.length > 1) {
        return (
            <span>
                {lines.map((l) => (
                    <p className={classes.Line} key={l}>
                        {l}
                    </p>
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
            color: theme.palette.primary.dark,
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
            {hidden ? <span className={classes.Blanked}>{content}</span> : content}
        </span>
    );
});

const ChoicesAnswer: React.FC<{ finalizeAnswer: (a: string) => void; choices: string[] }> = React.memo(
    ({ choices, finalizeAnswer }) => {
        return (
            <Grid spacing={1} justify="center" container item xs={12}>
                {shuffle(choices).map((c) => (
                    <Grid item key={c}>
                        <Chip label={c} onClick={finalizeAnswer.bind(null, c)} />
                    </Grid>
                ))}
            </Grid>
        );
    }
);

interface StandardAnswer {
    answer: string;
    finalizeAnswer: (a: string) => void;
    setAnswer: (a: string) => void;
}

const StandardAnswer: React.FC<StandardAnswer> = ({ answer, finalizeAnswer, setAnswer }) => (
    <Grid container spacing={1} item xs={12} alignItems="center" wrap="nowrap">
        <Grid item style={{ flexGrow: 1 }}>
            <TextField
                value={answer}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnswer(e.currentTarget.value)}
                label="answer"
            />
        </Grid>
        <Grid item>
            <Button onClick={finalizeAnswer.bind(null, answer)} variant="contained">
                Submit
            </Button>
        </Grid>
    </Grid>
);

const MarkCorrectButton: React.FC<{ markCorrect: () => void }> = ({ markCorrect }) => (
    <FAB variant="extended" onClick={markCorrect}>
        <Check />
        &nbsp;Mark Correct
    </FAB>
);

const stopWords = [
    'i',
    'me',
    'my',
    'myself',
    'we',
    'our',
    'ours',
    'ourselves',
    'you',
    "you're",
    "you've",
    "you'll",
    "you'd",
    'your',
    'yours',
    'yourself',
    'yourselves',
    'he',
    'him',
    'his',
    'himself',
    'she',
    "she's",
    'her',
    'hers',
    'herself',
    'it',
    "it's",
    'its',
    'itself',
    'they',
    'them',
    'their',
    'theirs',
    'themselves',
    'what',
    'which',
    'who',
    'whom',
    'this',
    'that',
    "that'll",
    'these',
    'those',
    'am',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'having',
    'do',
    'does',
    'did',
    'doing',
    'a',
    'an',
    'the',
    'and',
    'but',
    'if',
    'or',
    'because',
    'as',
    'until',
    'while',
    'of',
    'at',
    'by',
    'for',
    'with',
    'about',
    'against',
    'between',
    'into',
    'through',
    'during',
    'before',
    'after',
    'above',
    'below',
    'to',
    'from',
    'up',
    'down',
    'in',
    'out',
    'on',
    'off',
    'over',
    'under',
    'again',
    'further',
    'then',
    'once',
    'here',
    'there',
    'when',
    'where',
    'why',
    'how',
    'all',
    'any',
    'both',
    'each',
    'few',
    'more',
    'most',
    'other',
    'some',
    'such',
    'no',
    'nor',
    'not',
    'only',
    'own',
    'same',
    'so',
    'than',
    'too',
    'very',
    's',
    't',
    'can',
    'will',
    'just',
    'don',
    "don't",
    'should',
    "should've",
    'now',
    'd',
    'll',
    'm',
    'o',
    're',
    've',
    'y',
    'ain',
    'aren',
    "aren't",
    'couldn',
    "couldn't",
    'didn',
    "didn't",
    'doesn',
    "doesn't",
    'hadn',
    "hadn't",
    'hasn',
    "hasn't",
    'haven',
    "haven't",
    'isn',
    "isn't",
    'ma',
    'mightn',
    "mightn't",
    'mustn',
    "mustn't",
    'needn',
    "needn't",
    'shan',
    "shan't",
    'shouldn',
    "shouldn't",
    'wasn',
    "wasn't",
    'weren',
    "weren't",
    'won',
    "won't",
    'wouldn',
    "wouldn't",
];
