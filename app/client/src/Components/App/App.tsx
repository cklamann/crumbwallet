import React from 'react';
import Storage from '@aws-amplify/storage';
import Auth from '@aws-amplify/auth';
import awsconfig from './../../aws-exports';
Storage.configure(awsconfig);
Auth.configure(awsconfig);
import 'regenerator-runtime/runtime.js';
import EditDeckPage from '../Pages/EditDeckPage';
import EditCardPage from '../Pages/EditCardPage';
import CardPage from '../Pages/CardPage';
import HomePage from '../Pages/HomePage';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import { theme } from './../Style/Theme';
import { ThemeProvider, makeStyles, createStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Home';
import ExitIcon from '@material-ui/icons/Input';
import CSSBaseline from '@material-ui/core/CssBaseline';
import { withAuthenticator } from 'aws-amplify-react';

const useNavBarStyles = makeStyles(theme =>
    createStyles({
        IconButton: {
            color: theme.palette.text.primary,
        },
        body: {
            background: theme.palette.background.paper,
        },
    })
);

const App: React.FC<{}> = () => {
    const NavBarStyles = useNavBarStyles();

    return (
        <>
            <Container maxWidth="lg">
                <ThemeProvider theme={theme}>
                    <CSSBaseline />
                    <Router>
                        <AppBar position="static">
                            <Grid container justify="space-between">
                                <IconButton className={NavBarStyles.IconButton}>
                                    <Link className={NavBarStyles.IconButton} to="/">
                                        <HomeIcon />
                                    </Link>
                                </IconButton>
                                <IconButton
                                    onClick={() => Auth.signOut()}
                                    className={NavBarStyles.IconButton}
                                    edge="start"
                                >
                                    <ExitIcon />
                                </IconButton>
                            </Grid>
                        </AppBar>
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
