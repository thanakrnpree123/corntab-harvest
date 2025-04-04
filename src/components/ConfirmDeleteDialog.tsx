
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

interface ConfirmDeleteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmDeleteDialog({ open, setOpen, onConfirm }: ConfirmDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        ยืนยันการลบ
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          คุณแน่ใจหรือไม่ที่ต้องการลบรายการนี้? การดำเนินการนี้ไม่สามารถเรียกคืนได้
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="primary">ยกเลิก</Button>
        <Button 
          onClick={() => {
            onConfirm();
            setOpen(false);
          }} 
          color="error" 
          autoFocus
        >
          ยืนยันการลบ
        </Button>
      </DialogActions>
    </Dialog>
  );
}
