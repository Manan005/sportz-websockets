import { MATCH_STATUS } from "../validation/matches.js";

/**
 * Determine a match's status based on its start and end times relative to a reference time.
 * @param {string|number|Date} startTime - Match start time (Date, ISO string, or timestamp).
 * @param {string|number|Date} endTime - Match end time (Date, ISO string, or timestamp).
 * @param {Date} [now=new Date()] - Reference time to evaluate status against.
 * @returns {('SCHEDULED'|'LIVE'|'FINISHED')|null} `MATCH_STATUS.SCHEDULED` if `now` is before the start, `MATCH_STATUS.FINISHED` if `now` is on or after the end, `MATCH_STATUS.LIVE` otherwise; returns `null` if `startTime` or `endTime` cannot be parsed as valid dates.
 */
export function getMatchStatus(startTime, endTime, now = new Date()) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  if (now < start) {
    return MATCH_STATUS.SCHEDULED;
  }

  if (now >= end) {
    return MATCH_STATUS.FINISHED;
  }

  return MATCH_STATUS.LIVE;
}

/**
 * Ensure a match object's status reflects the computed status and update it via the provided updater when different.
 *
 * @param {Object} match - Match object containing at least `startTime`, `endTime`, and `status` properties; `status` may be modified by this function.
 * @param {(newStatus: string) => Promise<void>|void} updateStatus - Callback invoked with the computed status when an update is required; may perform asynchronous persistence.
 * @returns {string} The match's current status after synchronization.
 */
export async function syncMatchStatus(match, updateStatus) {
  const nextStatus = getMatchStatus(match.startTime, match.endTime);
  if (!nextStatus) {
    return match.status;
  }
  if (match.status !== nextStatus) {
    await updateStatus(nextStatus);
    match.status = nextStatus;
  }
  return match.status;
}
