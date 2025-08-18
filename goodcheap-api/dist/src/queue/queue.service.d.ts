import { QueueInterface } from '../common/interfaces/queue.interface';
export declare class QueueService implements QueueInterface {
    addAnalysisTask(url: string): Promise<string>;
    getAnalysisResult(jobId: string): Promise<any | null>;
    addJob(jobName: string, data: any): Promise<void>;
    processJob(jobName: string, handler: (data: any) => Promise<any>): Promise<void>;
    getJobStatus(jobId: string): Promise<string>;
}
