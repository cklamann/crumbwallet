import React, { useEffect, useState } from 'react';
import Auth from '@aws-amplify/auth';
import awsconfig from '../aws-exports';
Auth.configure(awsconfig);
import 'regenerator-runtime/runtime.js';
import { uploadToS3 } from './../Util';
import EditDeckPage from './Pages/EditDeckPage';
import EditCardPage from './Pages/EditCardPage';
import DeckPage from './Pages/DeckPage';
import HomePage from './Pages/HomePage/HomePage';
import { BrowserRouter as Router, Switch, Route, Link, useParams } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import { theme } from './Style/Theme';
import { ThemeProvider, makeStyles, createStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import HomeIcon from '@material-ui/icons/Home';
import ExitIcon from '@material-ui/icons/Input';
import CSSBaseline from '@material-ui/core/CssBaseline';
import { withAuthenticator } from 'aws-amplify-react';
import { ApolloError } from 'apollo-client';
import Modal from './Modals/Modal';
import { get } from 'lodash';

const useNavBarStyles = makeStyles((theme) =>
    createStyles({
        IconButton: {
            color: theme.palette.text.primary,
        },
        body: {
            background: theme.palette.background.paper,
        },
        LoadingBox: {
            height: '5px',
            width: '100%',
        },
    })
);

const useAppStyles = makeStyles((theme) =>
    createStyles({
        Container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
    })
);

interface LoadingStatus {
    queryLoading: boolean;
    mutationLoading: boolean;
    error: ApolloError;
}

const defaultLoadingContext = {
    error: undefined as LoadingStatus['error'],
    mutationLoading: false,
    queryLoading: false,
    setLoading: (val: Partial<LoadingStatus>) => {},
};

export const UserContext = React.createContext(''),
    LoadingContext = React.createContext(defaultLoadingContext);

const App: React.FC<{}> = () => {
    const navBarClasses = useNavBarStyles(),
        appClasses = useAppStyles(),
        [userId, setUserId] = useState(''),
        [loadingStatus, setLoadingStatus] = useState<LoadingStatus>({
            error: undefined,
            queryLoading: false,
            mutationLoading: false,
        }),
        { queryLoading, mutationLoading } = loadingStatus;

    useEffect(() => {
        Auth.currentUserInfo().then((i) => setUserId(i.attributes.sub));
    }, []);

    return (
        <>
            <Container className={appClasses.Container} maxWidth="lg">
                <UserContext.Provider value={userId}>
                    <LoadingContext.Provider
                        value={{
                            ...loadingStatus,
                            setLoading: (val) => setLoadingStatus({ ...loadingStatus, ...val }),
                        }}
                    >
                        <ThemeProvider theme={theme}>
                            <CSSBaseline />
                            <Router>
                                <Grid container direction="column">
                                    <Grid item container xs={12}>
                                        <AppBar position="static">
                                            <Grid container justify="space-between">
                                                <IconButton className={navBarClasses.IconButton}>
                                                    <Link className={navBarClasses.IconButton} to="/">
                                                        <HomeIcon />
                                                    </Link>
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => Auth.signOut()}
                                                    className={navBarClasses.IconButton}
                                                    edge="start"
                                                >
                                                    <ExitIcon />
                                                </IconButton>
                                            </Grid>
                                        </AppBar>
                                    </Grid>
                                    <Grid item container xs={12}>
                                        <Box className={navBarClasses.LoadingBox}>
                                            {(mutationLoading || queryLoading) && (
                                                <LinearProgress variant="indeterminate" color="secondary" />
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Switch>
                                    <Route exact path="/decks/:deckId/edit">
                                        <EditDeckPage />
                                    </Route>
                                    <Route exact path="/decks/:deckId/cards/:cardId?">
                                        <DeckPage />
                                    </Route>
                                    <Route exact path="/decks/:deckId/cards/:cardId/edit">
                                        <EditCardPage
                                            uploadToS3={(file: File, cardId: string) =>
                                                uploadToS3(file, cardId + '_' + file.name)
                                            }
                                        />
                                    </Route>

                                    <Route path="/*">
                                        <HomePage />
                                    </Route>
                                </Switch>
                            </Router>
                        </ThemeProvider>
                    </LoadingContext.Provider>
                </UserContext.Provider>
            </Container>
            <Modal
                isOpen={!!loadingStatus.error}
                content={get(loadingStatus, 'error.message')}
                title="Error!"
                onClose={() => setLoadingStatus({ ...loadingStatus, ...{ error: undefined } })}
            />
        </>
    );
};

//@ts-ignore -- typing is bad, does not support config object, only args...
export default withAuthenticator(App, {
    theme: {
        //targets background for login page
        container: { backgroundColor: theme.palette.background.default },
        //targets signin form section
        formSection: {
            marginTop: '20px',
            backgroundColor: theme.palette.primary.light,
        },
        //targets signin button
        button: { backgroundColor: theme.palette.primary.dark, color: theme.palette.text.primary },
        //targets links in signin form
        a: { color: theme.palette.action.active },
    },
});
