import React, { useEffect, useState } from 'react';
import { get } from 'local-storage';
import { IUser as User } from '../../../../server/models/Users';
import LoginPage from '../Pages/LoginPage/LoginPage';
import AdminPage from '../Pages/AdminPage/AdminPage';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { test } from './../../api/ApolloClient';
import client from './../../api/AxiosClient';
import Container from '@material-ui/core/Container';
import { theme } from './../Style/Theme';
import { ThemeProvider, makeStyles, createStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

const useAppBarStyles = makeStyles(theme =>
    createStyles({
        root: {},
        IconButton: {
            justifyContent: 'flex-start',
            marginLeft: theme.spacing(2),
        },
    })
);

//test();

export const UserContext = React.createContext<User>(null);

export default () => {
    const AppBarClasses = useAppBarStyles(),
        [user, setUser] = useState<User>();

    useEffect(() => {
        if (get('token')) {
            client.post<User>('/fetchUser', { token: get('token') })
                .then(res => setUser(res.data));
        }
    }, [])

    return (
        <Container maxWidth="lg">
            <UserContext.Provider value={user}>
                <ThemeProvider theme={theme}>
                    <AppBar className={AppBarClasses.root} position="static">
                        <IconButton className={AppBarClasses.IconButton} edge="start">
                            <MenuIcon />
                        </IconButton>
                    </AppBar>
                    <Router>
                        <Switch>
                            <Route exact path="/login">
                                <LoginPage setUser={setUser} />
                            </Route>
                            <Route exact path="/admin">
                                <AdminPage />
                            </Route>

                            <Route path="/*">
                                <div>Home</div>
                            </Route>
                        </Switch>
                    </Router>
                </ThemeProvider>
            </UserContext.Provider>
        </Container>
    );
};
