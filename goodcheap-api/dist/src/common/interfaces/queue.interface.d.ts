export interface QueueInterface {
    addJob(jobName: string, data: any): Promise<void>;
    processJob(jobName: string, handler: (data: any) => Promise<any>): void;
    getJobStatus(jobId: string): Promise<string>;
}
