
// Azure Application Insights integration for retrieving log data

interface AzureConfig {
  appId: string;
  apiKey: string;
  endpoint?: string;
}

interface LogQuery {
  timespan?: string;
  query: string;
}

interface LogEntry {
  timestamp: string;
  message: string;
  severity: string;
  jobId?: string;
  jobName?: string;
  operation?: string;
  customDimensions?: Record<string, any>;
  [key: string]: any;
}

interface QueryResult {
  tables: {
    name: string;
    columns: { name: string; type: string }[];
    rows: any[][];
  }[];
}

class AzureInsightsService {
  private config: AzureConfig | null = null;
  private endpoint = 'https://api.applicationinsights.io/v1/apps';

  constructor() {
    this.loadConfig();
  }

  setConfig(config: AzureConfig) {
    this.config = config;
    localStorage.setItem('azure_insights_config', JSON.stringify(config));
  }

  loadConfig(): AzureConfig | null {
    try {
      const storedConfig = localStorage.getItem('azure_insights_config');
      if (storedConfig) {
        this.config = JSON.parse(storedConfig);
      }
      return this.config;
    } catch (error) {
      console.error('Failed to load Azure Insights config:', error);
      return null;
    }
  }

  hasConfig(): boolean {
    return this.config !== null && !!this.config.appId && !!this.config.apiKey;
  }

  clearConfig() {
    this.config = null;
    localStorage.removeItem('azure_insights_config');
  }

  async queryLogs(options: LogQuery): Promise<LogEntry[]> {
    if (!this.hasConfig()) {
      throw new Error('Azure Application Insights not configured');
    }

    try {
      const { appId, apiKey } = this.config!;
      const timespan = options.timespan || 'PT24H'; // Default to last 24 hours
      const query = options.query || 'traces | order by timestamp desc';

      const response = await fetch(
        `${this.endpoint}/${appId}/query?timespan=${timespan}&query=${encodeURIComponent(query)}`,
        {
          headers: {
            'x-api-key': apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to query logs: ${response.statusText}`);
      }

      const result: QueryResult = await response.json();
      return this.parseQueryResults(result);
    } catch (error) {
      console.error('Error querying Azure logs:', error);
      throw error;
    }
  }

  async getJobLogs(jobId: string, timespan?: string): Promise<LogEntry[]> {
    const query = `
      traces 
      | where customDimensions.jobId == "${jobId}" 
      | order by timestamp desc
    `;
    
    return this.queryLogs({ query, timespan: timespan || 'P7D' });
  }

  async getRecentFailures(limit = 10): Promise<LogEntry[]> {
    const query = `
      traces 
      | where customDimensions.status == "failed" 
      | order by timestamp desc 
      | limit ${limit}
    `;
    
    return this.queryLogs({ query });
  }

  private parseQueryResults(result: QueryResult): LogEntry[] {
    if (!result.tables || result.tables.length === 0) {
      return [];
    }

    const table = result.tables[0];
    const columnNames = table.columns.map(c => c.name);

    return table.rows.map(row => {
      const entry: Record<string, any> = {};
      
      columnNames.forEach((name, index) => {
        entry[name] = row[index];
      });

      return entry as LogEntry;
    });
  }
}

export const azureInsightsService = new AzureInsightsService();
