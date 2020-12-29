import React from 'react';
import { withStyles } from '@material-ui/core';
import { TextField, TextFieldProps } from '@material-ui/core';

export const FullWidthTextField = withStyles({ root: { width: '100%' } })(TextField);
