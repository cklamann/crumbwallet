import React from 'react';
import { createStyles, makeStyles, withStyles, FormControl, InputLabel, Input } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import { capitalize } from 'lodash';

export const FullWidthTextField = withStyles({ root: { width: '100%' } })(TextField);

const useTextInputStyles = makeStyles((theme) =>
    createStyles({
        root: {},
        FormControl: {
            width: '100%',
        },
    })
);

export const TextInput: React.FC<{
    error?: boolean;
    name: string;
    required?: boolean;
    textarea?: boolean;
    updateFn: (name: string) => (val: any) => void;
    val: string;
}> = ({ error, name, required, textarea, updateFn, val }) => {
    const classes = useTextInputStyles();
    return (
        <FormControl error={error} required={required} className={classes.FormControl}>
            <InputLabel>{capitalize(name)}</InputLabel>
            <Input
                onFocus={(e) => e.target.select()}
                onChange={(e) => updateFn(name)(e.currentTarget.value)}
                value={val}
                multiline={!!textarea}
            />
        </FormControl>
    );
};
