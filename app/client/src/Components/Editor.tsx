import React, { useState, useRef, useEffect } from 'react';
import { createStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import { FormatBold, FormatItalic } from '@material-ui/icons';
import { convertToRaw, ContentBlock, ContentState, convertFromHTML, Editor, EditorState, RichUtils } from 'draft-js';
import Grid from '@material-ui/core/Grid';
import draftToHtml from 'draftjs-to-html';
import { noop } from 'lodash';
import Paper from '@material-ui/core/Paper';
import InputLabel from '@material-ui/core/InputLabel';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import './../../node_modules/draft-js/dist/Draft.css';

interface RichEditor {
    content: string;
    onChange: (content: string) => void;
}

const useStyles = makeStyles(theme =>
    createStyles({
        root: {},
        Editor: {
            width: '100%',
            border: `solid thin ${theme.palette.grey[700]}`,
            padding: '5px',
            flexRow: '1',
            cursor: 'text',
        },
    })
);

const RichEditor: React.FC<RichEditor> = ({ content, onChange }) => {
    const [editorState, _setEditorState] = useState<EditorState>(null),
        editorRef = useRef<any>(),
        classes = useStyles(),
        theme = useTheme();

    useEffect(() => {
        if (content !== undefined && !editorState) {
            if (content === '') {
                return setEditorState(EditorState.createEmpty());
            }
            const blocksFromHTML = convertFromHTML(content),
                state = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
            return setEditorState(EditorState.createWithContent(state));
        }
    }, [content]);

    const setEditorState = (state: EditorState) => {
        _setEditorState(state);
        return onChange(draftToHtml(convertToRaw(state.getCurrentContent())));
    };

    const _blockStyleFn = (contentBlock: ContentBlock) => {
        const type = contentBlock.getType();
        if (type === 'unstyled') {
            return 'content-block-default';
        }
    };

    return editorState ? (
        <Grid direction="column" wrap="nowrap" item container spacing={1} alignContent="flex-start" xs={12}>
            <Grid item>
                <Paper>
                    <Grid wrap="nowrap" container justify="space-between">
                        <Grid item container xs={6} alignItems="flex-end">
                            <InputLabel
                                required
                                error={!new DOMParser().parseFromString(content, 'text/html').body.innerText}
                                shrink={true}
                            >
                                Prompt
                            </InputLabel>
                        </Grid>
                        <Grid container item justify="flex-end">
                            <IconButton
                                tabIndex={-1}
                                size="small"
                                onMouseDown={e => e.preventDefault()}
                                style={{
                                    color: editorState.getCurrentInlineStyle().has('ITALIC')
                                        ? theme.palette.primary.light
                                        : theme.palette.primary.dark,
                                }}
                                onClick={() => setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'))}
                            >
                                <FormatItalic />
                            </IconButton>
                            <IconButton
                                tabIndex={-1}
                                size="small"
                                onMouseDown={e => {
                                    e.preventDefault();
                                }}
                                style={{
                                    color: editorState.getCurrentInlineStyle().has('BOLD')
                                        ? theme.palette.primary.light
                                        : theme.palette.primary.dark,
                                }}
                                onClick={() => setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'))}
                            >
                                <FormatBold />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
            <Grid onClick={editorRef.current ? editorRef.current.focus : noop} item container xs={12}>
                <Box className={classes.Editor}>
                    <Editor
                        blockStyleFn={_blockStyleFn}
                        editorState={editorState}
                        onChange={setEditorState}
                        placeholder="enter some text..."
                        ref={editorRef}
                        spellCheck={true}
                    />
                </Box>
            </Grid>
        </Grid>
    ) : null;
};

export default RichEditor;
