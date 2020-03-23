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
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Home';
import CSSBaseline from '@material-ui/core/CssBaseline';

const useNavBarStyles = makeStyles(theme =>
    createStyles({
        IconButton: {
            justifyContent: 'flex-start',
            marginLeft: theme.spacing(2),
        },
        body: {
            background: theme.palette.background.paper,
        },
    })
);

export default () => {
    const NavBarStyles = useNavBarStyles();

    return (
        <>
            <Container maxWidth="lg">
                <ThemeProvider theme={theme}>
                    <CSSBaseline />
                    <Router>
                        <Link to="/home">
                            <AppBar position="static">
                                <IconButton className={NavBarStyles.IconButton} edge="start">
                                    <HomeIcon />
                                </IconButton>
                            </AppBar>
                        </Link>
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
