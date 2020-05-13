import React, { useEffect, useState } from 'react';
import Storage from '@aws-amplify/storage';
import Auth from '@aws-amplify/auth';
import awsconfig from '../aws-exports';
Storage.configure(awsconfig);
Auth.configure(awsconfig);
import 'regenerator-runtime/runtime.js';
import EditDeckPage from './Pages/EditDeckPage';
import EditCardPage from './Pages/EditCardPage';
import CardPage from './Pages/CardPage';
import HomePage from './Pages/HomePage';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import { theme } from './Style/Theme';
import { ThemeProvider, makeStyles, createStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import HomeIcon from '@material-ui/icons/Home';
import ExitIcon from '@material-ui/icons/Input';
import CSSBaseline from '@material-ui/core/CssBaseline';
import { withAuthenticator } from 'aws-amplify-react';

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
}

const defaultLoadingContext = {
    queryLoading: false,
    mutationLoading: false,
    setLoading: (val: Partial<LoadingStatus>) => {},
};

export const UserContext = React.createContext(''),
    LoadingContext = React.createContext(defaultLoadingContext);

const App: React.FC<{}> = () => {
    const navBarClasses = useNavBarStyles(),
        appClasses = useAppStyles(),
        [userId, setUserId] = useState(''),
        [loadingStatus, setLoadingStatus] = useState({ queryLoading: false, mutationLoading: false }),
        { queryLoading, mutationLoading } = loadingStatus;

    useEffect(() => {
        Auth.currentUserInfo().then((i) => setUserId(i.attributes.sub));
    }, []);

    useEffect(() => {}, [loadingStatus]);

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
                                        <CardPage />
                                    </Route>
                                    <Route exact path="/decks/:deckId/cards/:cardId/edit">
                                        <EditCardPage
                                            uploadToS3={(file: File, cardId: string) =>
                                                Storage.put(cardId + '_' + file.name, file).then(
                                                    (res: { key: string }) => res.key
                                                )
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
