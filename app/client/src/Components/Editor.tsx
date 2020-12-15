import React, { useState, useRef, useEffect } from 'react';
import { createStyles, makeStyles, useTheme, Theme } from '@material-ui/core/styles';
import { Code, RemoveCircle, FormatBold, FormatItalic } from '@material-ui/icons';
import { convertToRaw, ContentState, convertFromHTML, Editor, EditorState, RichUtils } from 'draft-js';
import Grid from '@material-ui/core/Grid';
import draftToHtml from 'draftjs-to-html';
import { noop } from 'lodash';
import Paper from '@material-ui/core/Paper';
import InputLabel from '@material-ui/core/InputLabel';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import './../../node_modules/draft-js/dist/Draft.css';

interface RichEditor {
    initialContent: string;
    onChange: (initialContent: string) => void;
}

const useStyles = makeStyles((theme) =>
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

const RichEditor: React.FC<RichEditor> = ({ initialContent, onChange }) => {
    const [editorState, _setEditorState] = useState<EditorState>(null),
        editorRef = useRef<any>(),
        classes = useStyles(),
        theme = useTheme();

    useEffect(() => {
        if (!initialContent) {
            return setEditorState(EditorState.createEmpty());
        }
        const blocksFromHTML = convertFromHTML(initialContent),
            state = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
        setEditorState(EditorState.createWithContent(state));
    }, []);

    const setEditorState = (state: EditorState) => {
        _setEditorState(state);
        return onChange(draftToHtml(convertToRaw(state.getCurrentContent())));
    };

    return editorState ? (
        <Grid direction="column" wrap="nowrap" item container spacing={1} alignContent="flex-start" xs={12}>
            <Grid item>
                <Paper>
                    <Grid wrap="nowrap" container justify="space-between">
                        <Grid item container xs={6} alignItems="flex-end">
                            <InputLabel
                                required
                                error={!new DOMParser().parseFromString(initialContent, 'text/html').body.innerText}
                                shrink={true}
                            >
                                Details
                            </InputLabel>
                        </Grid>
                        <Grid container item justify="flex-end">
                            <InlineStyleButton
                                hasStyle={editorState.getCurrentInlineStyle().has('ITALIC')}
                                Icon={FormatItalic}
                                onClick={() => setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'))}
                                theme={theme}
                            />
                            <InlineStyleButton
                                hasStyle={editorState.getCurrentInlineStyle().has('BOLD')}
                                Icon={FormatBold}
                                onClick={() => setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'))}
                                theme={theme}
                            />
                            <InlineStyleButton
                                hasStyle={editorState.getCurrentInlineStyle().has('CODE')}
                                Icon={Code}
                                onClick={() => setEditorState(RichUtils.toggleInlineStyle(editorState, 'CODE'))}
                                theme={theme}
                            />
                            <InlineStyleButton
                                hasStyle={false}
                                Icon={RemoveCircle}
                                onClick={() =>
                                    setEditorState(
                                        EditorState.createWithContent(
                                            ContentState.createFromText(editorState.getCurrentContent().getPlainText())
                                        )
                                    )
                                }
                                theme={theme}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
            <Grid onClick={editorRef.current ? editorRef.current.focus : noop} item container xs={12}>
                <Box className={classes.Editor}>
                    <Editor
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

/* 

    to wipe out everything, need to select everything and remove all inline styles

    EditorState.forceSelection(editorState, <selectionstate>)

*/

export default RichEditor;

interface InlineStyleButton {
    hasStyle: boolean;
    Icon: React.ComponentType;
    onClick: () => void;
    theme: Theme;
}

const InlineStyleButton: React.FC<InlineStyleButton> = ({ hasStyle, Icon, onClick, theme }) => (
    <IconButton
        tabIndex={-1}
        size="small"
        onMouseDown={(e) => {
            e.preventDefault();
        }}
        style={{
            color: hasStyle ? theme.palette.primary.light : theme.palette.primary.dark,
        }}
        onClick={onClick}
    >
        <Icon />
    </IconButton>
);
