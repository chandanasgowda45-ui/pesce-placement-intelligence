export interface LogMetadata {
  runId?: string;
  stage?: string;
  provider?: string;
  duration?: number;
  companyName?: string;
  [key: string]: any;
}

const formatLog = (
  level: string,
  message: string,
  meta: LogMetadata
) => {
  const {
    runId = 'unknown',
    stage = 'orchestration',
    ...rest
  } = meta;

  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    runId,
    stage,
    message,
    ...rest
  });
};

export const logger = {
  info: (
    message: string,
    meta: LogMetadata = {}
  ) => console.info(
    formatLog('INFO', message, meta)
  ),

  warn: (
    message: string,
    meta: LogMetadata = {}
  ) => console.warn(
    formatLog('WARN', message, meta)
  ),

  error: (
    message: string,
    meta: LogMetadata = {}
  ) => console.error(
    formatLog('ERROR', message, meta)
  ),

  startTimer: () => Date.now(),

  getDuration: (
    startTime: number
  ) => Date.now() - startTime
};