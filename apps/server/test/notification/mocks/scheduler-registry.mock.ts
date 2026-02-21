import { CronJob } from 'cron'

export class MockSchedulerRegistry {
  private cronJobs = new Map<string, CronJob>()
  private intervals = new Map<string, NodeJS.Timeout>()
  private timeouts = new Map<string, NodeJS.Timeout>()

  doesExist(type: 'cron' | 'interval' | 'timeout', name: string): boolean {
    switch (type) {
      case 'cron':
        return this.cronJobs.has(name)
      case 'interval':
        return this.intervals.has(name)
      case 'timeout':
        return this.timeouts.has(name)
      default:
        return false
    }
  }

  addCronJob(name: string, job: CronJob): void {
    this.cronJobs.set(name, job)
  }

  deleteCronJob(name: string): void {
    const job = this.cronJobs.get(name)
    if (job) {
      job.stop()
      this.cronJobs.delete(name)
    }
  }

  getCronJob(name: string): CronJob {
    const job = this.cronJobs.get(name)
    if (!job) {
      throw new Error(`Cron job ${name} not found`)
    }
    return job
  }

  getCronJobs(): Map<string, CronJob> {
    return this.cronJobs
  }

  addInterval(name: string, interval: NodeJS.Timeout): void {
    this.intervals.set(name, interval)
  }

  deleteInterval(name: string): void {
    const interval = this.intervals.get(name)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(name)
    }
  }

  getInterval(name: string): NodeJS.Timeout {
    const interval = this.intervals.get(name)
    if (!interval) {
      throw new Error(`Interval ${name} not found`)
    }
    return interval
  }

  addTimeout(name: string, timeout: NodeJS.Timeout): void {
    this.timeouts.set(name, timeout)
  }

  deleteTimeout(name: string): void {
    const timeout = this.timeouts.get(name)
    if (timeout) {
      clearTimeout(timeout)
      this.timeouts.delete(name)
    }
  }

  getTimeout(name: string): NodeJS.Timeout {
    const timeout = this.timeouts.get(name)
    if (!timeout) {
      throw new Error(`Timeout ${name} not found`)
    }
    return timeout
  }

  reset(): void {
    // Stop all cron jobs
    this.cronJobs.forEach((job) => job.stop())
    this.cronJobs.clear()

    // Clear all intervals
    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals.clear()

    // Clear all timeouts
    this.timeouts.forEach((timeout) => clearTimeout(timeout))
    this.timeouts.clear()
  }
}
