
import { useState } from "react";
import { JobLog } from "@/lib/types";
import { 
  Box, 
  Card, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography, 
  Chip,
  Collapse, 
  IconButton, 
  Grid, 
  Paper
} from "@mui/material";
import { 
  Search as SearchIcon, 
  ExpandMore as ExpandMoreIcon, 
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  AccessTime as ClockIcon
} from "@mui/icons-material";
import { InputAdornment } from "@mui/material";
import { format } from "date-fns";

interface LogListProps {
  logs: JobLog[];
  isLoading?: boolean;
}

export function LogList({ logs, isLoading = false }: LogListProps) {
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [logId]: !prev[logId],
    }));
  };

  // Filter logs based on status and search term
  const filteredLogs = logs.filter((log) => {
    // Filter by status
    if (filterStatus && log.status !== filterStatus) return false;
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        log.output.toLowerCase().includes(searchLower) ||
        (log.error && log.error.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy HH:mm:ss");
    } catch (e) {
      return dateString;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircleIcon fontSize="small" />;
      case "failed":
        return <ErrorIcon fontSize="small" />;
      case "running":
        return <PlayArrowIcon fontSize="small" />;
      case "paused":
        return <PauseIcon fontSize="small" />;
      default:
        return <ClockIcon fontSize="small" />;
    }
  };

  const getStatusColor = (status: string): "success" | "error" | "warning" | "info" | "default" => {
    switch (status) {
      case "success":
        return "success";
      case "failed":
        return "error";
      case "running":
        return "info";
      case "paused":
        return "warning";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Box sx={{ textAlign: "center", p: 4, color: "text.secondary" }}>
        <Typography>ไม่พบข้อมูลล็อก</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 3, justifyContent: "space-between" }}>
        <TextField
          placeholder="ค้นหาในล็อก..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: "100%", sm: "auto" }, maxWidth: { sm: 300 } }}
        />
        
        <FormControl sx={{ width: { xs: "100%", sm: 200 } }}>
          <InputLabel id="status-filter-label">กรองตามสถานะ</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={filterStatus}
            label="กรองตามสถานะ"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="">ทั้งหมด</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="running">Running</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ maxHeight: "35vh", overflow: "auto" }}>
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <Card key={log.id} sx={{ mb: 2, overflow: "hidden" }}>
              <Box 
                sx={{ 
                  p: 2, 
                  display: "flex", 
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => toggleLogExpansion(log.id)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Chip
                    label={log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    color={getStatusColor(log.status)}
                    size="small"
                    icon={getStatusIcon(log.status)}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(log.startTime)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {log.duration && (
                    <Chip 
                      label={`${log.duration.toFixed(2)}s`} 
                      variant="outlined" 
                      size="small"
                    />
                  )}
                  <IconButton size="small">
                    {expandedLogs[log.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
              </Box>
              
              <Collapse in={expandedLogs[log.id]}>
                <Box sx={{ p: 2, pt: 0, borderTop: 1, borderColor: "divider" }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>เริ่ม</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(log.startTime)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>สิ้นสุด</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(log.endTime)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>ผลลัพธ์</Typography>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          bgcolor: "action.hover", 
                          maxHeight: 200, 
                          overflow: "auto",
                          fontFamily: "monospace",
                          fontSize: "0.875rem"
                        }}
                      >
                        {log.output || "ไม่มีข้อมูล"}
                      </Paper>
                    </Grid>
                    {log.error && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="error" gutterBottom>ข้อผิดพลาด</Typography>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 2, 
                            bgcolor: "error.light", 
                            color: "error.dark",
                            maxHeight: 200, 
                            overflow: "auto",
                            fontFamily: "monospace",
                            fontSize: "0.875rem"
                          }}
                        >
                          {log.error}
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Collapse>
            </Card>
          ))
        ) : (
          <Box sx={{ textAlign: "center", p: 4, color: "text.secondary" }}>
            <Typography>ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
