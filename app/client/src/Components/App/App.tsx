import React, { useEffect, useState } from 'react';
import Storage from '@aws-amplify/storage';
import Auth from '@aws-amplify/auth';
import awsconfig from './../../aws-exports';
Storage.configure(awsconfig);
Auth.configure(awsconfig);
import 'regenerator-runtime/runtime.js';
import EditDeckPage from '../Pages/EditDeckPage';
import EditCardPage from '../Pages/EditCardPage';
import HomePage from '../Pages/HomePage';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import { theme } from './../Style/Theme';
import { ThemeProvider, makeStyles, createStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Home';

const useNavBarStyles = makeStyles(theme =>
    createStyles({
        IconButton: {
            justifyContent: 'flex-start',
            marginLeft: theme.spacing(2),
        },
    })
);

export default () => {
    const NavBarStyles = useNavBarStyles();

    return (
        <Container maxWidth="lg">
            <ThemeProvider theme={theme}>
                <Router>
                    <Link to="/home">
                        <AppBar position="static">
                            <IconButton className={NavBarStyles.IconButton} edge="start">
                                <HomeIcon />
                            </IconButton>
                        </AppBar>
                    </Link>
                    <Switch>
                        <Route exact path="/editDeck/:deckId">
                            <EditDeckPage />
                        </Route>
                        <Route exact path="/editCard/:cardId">
                            <EditCardPage
                                uploadToS3={(file: File) =>
                                    Storage.put(
                                        Math.random()
                                            .toString(36)
                                            .slice(2) +
                                            '_' +
                                            file.name,
                                        file
                                    ).then((res: { key: string }) => res.key)
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
    );
};
