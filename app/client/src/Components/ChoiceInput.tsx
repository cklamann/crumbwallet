import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Done from '@material-ui/icons/Done';
import Close from '@material-ui/icons/CloseRounded';

interface ChoiceInput {
    choices: string[];
    updateChoices: (choices: string[]) => void;
}

const ChoiceInput: React.FC<ChoiceInput> = ({ choices, updateChoices }) => {
    const [text, setText] = useState<string>(''),
        handleSubmit = () => {
            updateChoices([text].concat(choices));
            setText('');
        };
    return (
        <Grid container spacing={1}>
            <Grid item container justify="space-between" alignContent="center" xs={12}>
                <TextField
                    onKeyUp={e => {
                        if (e.keyCode == 13) {
                            handleSubmit();
                        }
                    }}
                    label="Choice"
                    onChange={e => setText(e.currentTarget.value)}
                    value={text}
                />
                <Button variant="outlined" disabled={!text} onClick={handleSubmit}>
                    Add
                </Button>
            </Grid>
            <Grid item container xs={12}>
                {choices.map((c, i) => (
                    <Chip
                        style={{ margin: '2px' }}
                        key={i}
                        label={c}
                        deleteIcon={<Close />}
                        onDelete={updateChoices.bind(
                            null,
                            choices.filter(ca => ca !== c)
                        )}
                    />
                ))}
            </Grid>
        </Grid>
    );
};

export default ChoiceInput;
