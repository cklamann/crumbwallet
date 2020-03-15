import React, { useState, useRef, useEffect } from 'react';
import { theme } from './Style/Theme';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { FormatIndentDecrease, FormatBold, FormatItalic } from '@material-ui/icons';
import {
    AtomicBlockUtils,
    CompositeDecorator,
    convertToRaw,
    ContentBlock,
    ContentState,
    convertFromHTML,
    getDefaultKeyBinding,
    Editor,
    EditorState,
    KeyBindingUtil,
    RichUtils,
} from 'draft-js';
import Grid from '@material-ui/core/Grid';
import draftToHtml from 'draftjs-to-html';
import { get, noop } from 'lodash';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import './../../../../../../node_modules/draft-js/dist/Draft.css';

interface RichEditor {
    content: string;
    update: (content: string) => Promise<any>;
}

const useStyles = makeStyles(theme =>
    createStyles({
        root: {},
        Toolbar: {
            display: 'flex',
            justifyContent: 'space-between',
        },
    })
);

const RichEditor: React.FC<RichEditor> = ({ content, update }) => {
    const [editorState, _setEditorState] = useState<EditorState>(EditorState.createEmpty(decorator)),
        [inputKey, setInputKey] = useState(
            Math.random()
                .toString(36)
                .slice(4)
        ),
        editorRef = useRef<any>(),
        classes = useStyles();

    useEffect(() => {
        const blocksFromHTML = convertFromHTML(content),
            state = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
        setEditorState(EditorState.createWithContent(state));
    }, [content]);

    const setEditorState = (state: EditorState) => {
        return _setEditorState(EditorState.set(state, { decorator }));
    };

    const removeImage = (key: string) => {
        /* todo: figure out */
    };

    const _keyBindingFn = (e: any) => {
        const { hasCommandModifier } = KeyBindingUtil;
        if (e.keyCode === 83 /* `S` key */ && hasCommandModifier(e)) {
            return 'save';
        }
        return getDefaultKeyBinding(e);
    };

    const _handleKeyCommand = (command: string, editorState: EditorState) => {
        if (command === 'save') {
            saveDraft(editorState);
            return 'handled';
        }

        const newState = RichUtils.handleKeyCommand(editorState, command);

        if (newState) {
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    };

    const _blockStyleFn = (contentBlock: ContentBlock) => {
        const type = contentBlock.getType();
        if (type === 'unstyled') {
            return 'content-block-default';
        }
    };

    const save = (editorState: EditorState) =>
        update(draftToHtml(convertToRaw(editorState.getCurrentContent())).replace(/\r\n|\n|\r/gm, '<br/>'));

    const insertImage = (src: string) => {
        const contentState = editorState.getCurrentContent(),
            contentStateWithEntity = contentState.createEntity('IMAGE', 'IMMUTABLE', { src }),
            entityKey = contentStateWithEntity.getLastCreatedEntityKey(),
            newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
        setEditorState(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
    };

    return (
        <>
            <Grid direction="column" wrap="nowrap" item container spacing={1} alignContent="flex-start" xs={12}>
                <Grid item>
                    <Toolbar className={classes.Toolbar}>
                        <Paper>
                            {/* capture event that withdraws editor focus */}
                            <IconButton
                                onMouseDown={e => e.preventDefault()}
                                style={{ color: editorState.getCurrentInlineStyle().has('ITALIC') ? 'blue' : 'black' }}
                                onClick={() => setEditorState(RichUtils.toggleInlineStyle(editorState, 'ITALIC'))}
                            >
                                <FormatItalic />
                            </IconButton>
                            <IconButton
                                onMouseDown={e => {
                                    e.preventDefault();
                                }}
                                style={{ color: editorState.getCurrentInlineStyle().has('BOLD') ? 'blue' : 'black' }}
                                onClick={() => setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'))}
                            >
                                <FormatBold />
                            </IconButton>
                            <IconButton
                                onMouseDown={e => e.preventDefault()}
                                style={{
                                    color:
                                        editorState
                                            .getCurrentContent()
                                            .getBlockForKey(editorState.getSelection().getStartKey())
                                            .getType() === 'blockquote'
                                            ? theme.palette.primary.main
                                            : 'black',
                                }}
                                onClick={() => setEditorState(RichUtils.toggleBlockType(editorState, 'blockquote'))}
                            >
                                <FormatIndentDecrease />
                            </IconButton>
                            <input
                                key={inputKey}
                                type="file"
                                onMouseDown={e => e.preventDefault()}
                                onChange={e => {
                                    //todo: this should probably be passed in and should be serverless
                                    //also,probably need a periodic purge of orphaned images if we're posting them all...
                                    postToS3(e.currentTarget.files[0]);
                                    setInputKey(
                                        Math.random()
                                            .toString(36)
                                            .slice(4)
                                    );
                                }}
                                accept=".jpg"
                            />
                        </Paper>
                    </Toolbar>
                </Grid>
                <Grid onClick={editorRef.current ? editorRef.current.focus : noop} item container xs={12}>
                    <StyledWrapper>
                        <Editor
                            blockRendererFn={imageBlockRenderer}
                            blockStyleFn={_blockStyleFn}
                            editorState={editorState}
                            handleKeyCommand={_handleKeyCommand}
                            keyBindingFn={_keyBindingFn}
                            onChange={setEditorState}
                            placeholder="enter some text..."
                            ref={editorRef}
                            spellCheck={true}
                        />
                    </StyledWrapper>
                </Grid>
                <Grid item container>
                    <Button variant="contained" color="primary" onClick={save.bind(null, editorState)}>
                        Save
                    </Button>
                </Grid>
            </Grid>
            <Dialog
                open={false}
                PaperProps={{
                    style: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                    },
                }}
            >
                <DialogContent>
                    <CircularProgress />
                </DialogContent>
            </Dialog>
        </>
    );
};

export default RichEditor;


//todo: deal with this
const StyledWrapper = styled.div`
    width: 100%;
    border: solid thin;
    padding: 5px;
    min-height: 250px;
    flex-row: 1;
    cursor: text;
    img {
        display: block;
        margin: 0 auto;
        max-width: 100%;
    }
    .content-block-default {
        margin-bottom: ${theme.spacing(1)}px;
    }
`;

const imageBlockRenderer = (block: ContentBlock) => {
    if (block.getType() === 'atomic') {
        return {
            component: ({ contentState, block }: { contentState: Draft.ContentState; block: Draft.ContentBlock }) => {
                const entity = contentState.getEntity(block.getEntityAt(0));
                const { src } = entity.getData();
                return <img src={src} />;
            },
            editable: false,
        };
    }
    return null;
};

const findImageEntities = (contentBlock: ContentBlock, callback: any, contentState: ContentState) => {
    contentBlock.findEntityRanges(character => {
        const entityKey = character.getEntity();
        return entityKey !== null && contentState.getEntity(entityKey).getType() === 'IMAGE';
    }, callback);
};
//todo: merge into imageBlockRenderer once rendering
const Image: React.FC<{ contentState: ContentState; entityKey: string }> = ({ contentState, entityKey }) => {
    const { height, src, width } = contentState.getEntity(entityKey).getData();
    return <img src={src} height={height} width={width} />;
};

const decorator = new CompositeDecorator([
    {
        strategy: findImageEntities,
        component: Image,
    },
]);
