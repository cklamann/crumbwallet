import { useHistory } from 'react-router-dom';

export default () => {
    const history = useHistory();
    return (path: string) => history.push(path);
};
