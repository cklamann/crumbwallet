import React from 'react';
import Box from '@material-ui/core/Box';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { S3Image } from 'aws-amplify-react';

const useImageStyles = makeStyles(theme =>
    createStyles({
        root: { overflow: 'hidden' },
    })
);

const Image: React.FC<S3Image['props']> = props => {
    const newProps = {
            ...props,
            theme: {
                photoImg: {
                    objectFit: 'cover',
                    maxWidth: '300px',
                    maxHeight: '300px',
                },
            },
        },
        classes = useImageStyles();
    return (
        <Box className={classes.root}>
            <S3Image {...newProps} />
        </Box>
    );
};

export default Image;
