import { createMuiTheme } from '@material-ui/core/styles';
import amber from '@material-ui/core/colors/amber';
import grey from '@material-ui/core/colors/grey';

export const theme = createMuiTheme({
    palette: {
        primary: grey,
        secondary: amber,
        type: 'dark',
    },
});
