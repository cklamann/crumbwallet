import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { theme } from './../../Style/Theme';
import { IUser as User } from '../../../../../server/models/Users';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormGroup from '@material-ui/core/FormGroup';
import Button from '@material-ui/core/Button';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import client from '../../../api/AxiosClient';
import { set } from 'local-storage';

const useLoginPageStyles = makeStyles(theme =>
	createStyles({
		root: {},
		FormGroup: {
			alignItems: 'flex-start',
		},
	})
);

const LoginPage: React.FC<{ setUser: (user: User) => void }> = ({ setUser }) => {
	const [username, setUsername] = useState<string>(),
		[password, setPassword] = useState<string>(),
		classes = useLoginPageStyles(),
		history = useHistory(),
		submit = () => client.post<{ user: User }>(`login`, { username, password }).then(res => {
			client.defaults.headers.common['Authorization'] = res.headers.authorization;
			set('token', (res.headers.authorization as string).replace('Bearer ', ''));
			setUser(res.data.user);
			history.push('/admin');
		});

	return <Grid container direction="column" justify="center">
		<Grid container item xs={12} direction="column" justify="center">
			<form>
				<Grid item xs={12} container>
					<FormGroup className={classes.FormGroup}>
						<Grid item xs={12} container>
							<TextField label="username" onChange={e => setUsername(e.currentTarget.value)} />
						</Grid>
						<Grid item xs={12} container>
							<TextField
								type="password"
								label="password"
								onChange={e => setPassword(e.currentTarget.value)}
							/>
						</Grid>
						<Button onClick={submit}>Submit</Button>
					</FormGroup>
				</Grid>
			</form>
		</Grid>
	</Grid>

}

export default LoginPage;
