
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Menu,
  MenuItem,
  Typography,
  IconButton,
  Pagination,
  Box
} from '@mui/material';
import { StatusBadge } from "@/components/StatusBadge";
import { MoreHorizontal, Copy, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CronJob } from "@/lib/types";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

interface JobsTableProps {
  jobs: CronJob[]
  onEdit: (job: CronJob) => void
  onDelete: (job: CronJob) => void
  onDuplicate: (job: CronJob) => void
}

export function JobsTable({ jobs, onEdit, onDelete, onDuplicate }: JobsTableProps) {
  const { toast } = useToast();
  const [jobToDelete, setJobToDelete] = useState<CronJob | null>(null);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, job: CronJob) => {
    setAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedJob(null);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage - 1);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ชื่องาน</TableCell>
              <TableCell>ตารางเวลา</TableCell>
              <TableCell>ปลายทาง</TableCell>
              <TableCell>ทำงานล่าสุด</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.length ? (
              jobs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.name}</TableCell>
                  <TableCell>{job.schedule}</TableCell>
                  <TableCell>{job.endpoint}</TableCell>
                  <TableCell>{job.lastRun ? dayjs(job.lastRun).fromNow() : "ไม่เคยรัน"}</TableCell>
                  <TableCell>
                    <StatusBadge status={job.status} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleOpenMenu(e, job)}>
                      <MoreHorizontal className="h-4 w-4" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">ไม่พบข้อมูล</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {jobs.length} row(s)
        </Typography>
        <Pagination
          count={Math.ceil(jobs.length / rowsPerPage)}
          page={page + 1}
          onChange={handleChangePage}
          color="primary"
          size="small"
        />
      </Box>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          if (selectedJob) onDuplicate(selectedJob);
          handleCloseMenu();
        }} sx={{ gap: 1 }}>
          <Copy className="h-4 w-4" />
          คัดลอก
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedJob) onEdit(selectedJob);
          handleCloseMenu();
        }} sx={{ gap: 1 }}>
          <Edit className="h-4 w-4" />
          แก้ไข
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedJob) {
            setJobToDelete(selectedJob);
            setOpen(true);
          }
          handleCloseMenu();
        }} sx={{ gap: 1, color: 'error.main' }}>
          <Trash className="h-4 w-4" />
          ลบ
        </MenuItem>
      </Menu>
      
      <ConfirmDeleteDialog
        open={open}
        setOpen={setOpen}
        onConfirm={() => {
          if (jobToDelete) {
            onDelete(jobToDelete);
            toast({
              title: "ลบงานสำเร็จ",
              description: `งาน "${jobToDelete.name}" ถูกลบแล้ว`,
            });
            setJobToDelete(null);
          }
        }}
      />
    </>
  );
}
