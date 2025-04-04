
import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, CircularProgress } from '@mui/material';
import { JobLog } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

export interface LogListProps {
  logs: JobLog[];
  isLoading?: boolean;
}

export function LogList({ logs, isLoading = false }: LogListProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress size={24} sx={{ mr: 1 }} />
        <Typography variant="body2">กำลังโหลด...</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>Start Time</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Output</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <StatusBadge status={log.status} />
                </TableCell>
                <TableCell>{dayjs(log.startTime).format('DD/MM/YYYY HH:mm:ss')}</TableCell>
                <TableCell>{log.duration ? `${log.duration.toFixed(2)}s` : "-"}</TableCell>
                <TableCell>
                  <Box sx={{ 
                    maxWidth: '300px', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                  }}>
                    {log.output || "-"}
                  </Box>
                  {log.error && (
                    <Typography color="error" variant="caption">
                      {log.error}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  ไม่มีข้อมูล
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
