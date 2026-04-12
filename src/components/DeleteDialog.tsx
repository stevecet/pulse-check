import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";

interface DeleteInterface {
  handleDelete: () => Promise<void>;
  handleClose: () => void;
  title: string;
  message: string;
  open: boolean;
}

export default function DeleteDialog({
  handleDelete,
  handleClose,
  title,
  message,
  open,
}: Readonly<DeleteInterface>) {
  const [isDeleting, setIsDeleting] = useState(false);

  const onConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDelete();
      handleClose();
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : handleClose}
      aria-labelledby="delete-dialog-title"
    >
      <DialogTitle id="delete-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ pb: 2, px: 3 }}>
        <Button onClick={handleClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={onConfirmDelete}
          color="error"
          variant="contained"
          disabled={isDeleting}
          startIcon={
            isDeleting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
