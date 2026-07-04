export function buildFailureSummary({ queueName, jobName, errorMessage, attempts }) {
  const trimmedMessage = (errorMessage || '').trim();
  const queue = queueName || 'queue';
  const job = jobName || 'job';
  const attemptText = attempts ? `${attempts} attempts` : 'multiple attempts';

  if (!trimmedMessage) {
    return `${queue} job ${job} failed after ${attemptText} without a detailed error.`;
  }

  const normalized = trimmedMessage.replace(/\s+/g, ' ');
  if (/tim(e|ed)? out/i.test(normalized)) {
    return `${queue} job ${job} timed out after ${attemptText}, indicating the worker did not finish within the allowed runtime.`;
  }

  if (/connection|network|refused|timeout/i.test(normalized)) {
    return `${queue} job ${job} failed because of a connectivity issue after ${attemptText}: ${normalized}`;
  }

  return `${queue} job ${job} failed after ${attemptText}: ${normalized}`;
}
