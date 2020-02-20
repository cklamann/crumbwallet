import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import client from '../../../api/AxiosClient';
import { test } from '../../../api/ApolloClient';
import { UserContext } from '../../App/App';

const AdminPage: React.FC<any> = props => {
    const history = useHistory(),
        user = useContext(UserContext);
    useEffect(() => {
        client.get('verifyLoggedIn')
            .then(() => test())
            .catch(() => history.push('/login'));
    }, [user])

    return user ? <span>Hello {user.name}!</span> : <span>loading user</span>
}

export default AdminPage;