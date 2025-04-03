
import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  IconButton,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';

// Mock data
const statCards = [
  { title: 'Total Jobs', value: '124', color: 'primary.main' },
  { title: 'Running Jobs', value: '45', color: 'success.main' },
  { title: 'Paused Jobs', value: '12', color: 'warning.main' },
  { title: 'Failed Jobs', value: '3', color: 'error.main' },
];

const recentJobs = [
  { id: 1, name: 'Daily Database Backup', status: 'success', lastRun: '2023-10-15 13:45', nextRun: '2023-10-16 13:45' },
  { id: 2, name: 'User Reports Generation', status: 'failed', lastRun: '2023-10-15 10:30', nextRun: '2023-10-16 10:30' },
  { id: 3, name: 'Email Newsletter', status: 'paused', lastRun: '2023-10-14 08:00', nextRun: '-' },
  { id: 4, name: 'System Health Check', status: 'running', lastRun: '2023-10-15 14:00', nextRun: '2023-10-15 15:00' },
  { id: 5, name: 'Analytics Processing', status: 'success', lastRun: '2023-10-15 12:00', nextRun: '2023-10-16 12:00' },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <CheckCircleIcon fontSize="small" color="success" />;
    case 'failed':
      return <ErrorIcon fontSize="small" color="error" />;
    case 'running':
      return <RefreshIcon fontSize="small" color="info" />;
    case 'paused':
      return <PauseIcon fontSize="small" color="warning" />;
    default:
      return null;
  }
};

const getStatusChip = (status: string) => {
  let color: 'success' | 'error' | 'warning' | 'info' = 'info';
  let label = status.charAt(0).toUpperCase() + status.slice(1);
  
  switch (status) {
    case 'success':
      color = 'success';
      break;
    case 'failed':
      color = 'error';
      break;
    case 'paused':
      color = 'warning';
      break;
    default:
      color = 'info';
  }
  
  return <Chip size="small" icon={getStatusIcon(status)} label={label} color={color} />;
};

export default function Index() {
  const [jobs] = useState(recentJobs);
  
  return (
    <MainLayout>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">
                  {card.title}
                </Typography>
                <Typography variant="h3" sx={{ color: card.color, my: 1 }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Recent Jobs */}
      <Card>
        <CardHeader 
          title="Recent Jobs" 
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
        />
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Last Run</TableCell>
                  <TableCell align="center">Next Run</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell component="th" scope="row">
                      {job.name}
                    </TableCell>
                    <TableCell align="center">
                      {getStatusChip(job.status)}
                    </TableCell>
                    <TableCell align="center">{job.lastRun}</TableCell>
                    <TableCell align="center">{job.nextRun}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        {job.status === 'paused' ? (
                          <IconButton size="small" color="primary">
                            <PlayArrowIcon fontSize="small" />
                          </IconButton>
                        ) : job.status !== 'running' ? (
                          <IconButton size="small" color="warning">
                            <PauseIcon fontSize="small" />
                          </IconButton>
                        ) : null}
                        <IconButton size="small" color="primary">
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button variant="outlined">View All Jobs</Button>
          </Box>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
