import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { flow, noop } from 'lodash';

interface Modal {
    acceptText?: string;
    content: string | JSX.Element;
    isOpen: boolean;
    onAccept?: () => void;
    onClose: () => void;
    onReject?: () => void;
    rejectText?: string;
    title: string | JSX.Element;
}

const Modal: React.FC<Modal> = ({ acceptText, content, isOpen, onAccept, onClose, onReject, rejectText, title }) => (
    <Dialog open={isOpen} onClose={onClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            <DialogContentText>{content}</DialogContentText>
        </DialogContent>
        <DialogActions>
            {onReject ? (
                <Button onClick={flow(onReject || noop, onClose)} color="primary">
                    {rejectText ? rejectText : 'Cancel'}
                </Button>
            ) : null}
            <Button onClick={flow(onAccept || noop, onClose)} color="primary" autoFocus>
                {acceptText ? acceptText : 'OK'}
            </Button>
        </DialogActions>
    </Dialog>
);

export default Modal;
