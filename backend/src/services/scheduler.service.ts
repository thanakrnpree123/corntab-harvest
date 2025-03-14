
import { AppDataSource } from "../data-source";
import { CronJob } from "../entity/CronJob";
import { JobLog } from "../entity/JobLog";
import { JobController } from "../controllers/job.controller";
import { format, parseISO, addSeconds } from "date-fns";
import { toZonedTime, format as formatTz } from "date-fns-tz";

class SchedulerService {
  private jobRepository = AppDataSource.getRepository(CronJob);
  private logRepository = AppDataSource.getRepository(JobLog);
  private activeJobs: Map<string, NodeJS.Timeout> = new Map();

  // เริ่มการทำงานของ scheduler
  async initialize() {
    console.log("Initializing scheduler service...");
    // โหลดงานที่มีสถานะไม่ใช่ paused
    const jobs = await this.jobRepository.find({
      where: [
        { status: "idle" },
        { status: "success" },
        { status: "failed" }
      ]
    });

    // เริ่มการทำงานของแต่ละงาน
    for (const job of jobs) {
      this.scheduleJob(job);
    }

    console.log(`Scheduled ${jobs.length} jobs`);
  }

  // จัดการตารางเวลาของงาน
  scheduleJob(job: CronJob) {
    // ถ้างานนี้กำลังทำงานอยู่แล้ว ให้ยกเลิกก่อน
    if (this.activeJobs.has(job.id)) {
      this.cancelJob(job.id);
    }

    // คำนวณเวลาที่จะทำงานต่อไป (ในตัวอย่างนี้ใช้เวลาง่ายๆ)
    // ในการใช้งานจริงควรใช้ไลบรารีสำหรับ cron expressions เช่น node-cron
    const interval = this.parseScheduleToMilliseconds(job.schedule);
    
    // ตั้งเวลาทำงาน
    const timeout = setTimeout(async () => {
      await this.executeJob(job);
      // หลังจากทำงานเสร็จ ตั้งเวลาใหม่
      const updatedJob = await this.jobRepository.findOneBy({ id: job.id });
      if (updatedJob && updatedJob.status !== "paused") {
        this.scheduleJob(updatedJob);
      }
    }, interval);

    // บันทึกข้อมูลงาน
    this.activeJobs.set(job.id, timeout);
    
    // อัพเดทเวลาที่จะทำงานต่อไป
    let nextRun = new Date(Date.now() + interval);
    
    // ถ้าใช้ local time ให้ปรับตาม timezone ที่ระบุ
    if (job.useLocalTime && job.timezone) {
      try {
        // แปลงเวลาให้เป็น timezone ที่กำหนด
        nextRun = toZonedTime(nextRun, job.timezone);
        console.log(`Next run for job "${job.name}" in ${job.timezone}: ${formatTz(nextRun, "yyyy-MM-dd HH:mm:ss", { timeZone: job.timezone })}`);
      } catch (error) {
        console.error(`Error converting time to timezone ${job.timezone}: ${error.message}`);
      }
    }
    
    this.jobRepository.update(job.id, { nextRun });
  }

  // ยกเลิกการทำงานของงาน
  cancelJob(jobId: string) {
    const timeout = this.activeJobs.get(jobId);
    if (timeout) {
      clearTimeout(timeout);
      this.activeJobs.delete(jobId);
    }
  }

  // หยุดการทำงานของงาน
  async pauseJob(jobId: string) {
    this.cancelJob(jobId);
    await this.jobRepository.update(jobId, { status: "paused" });
  }

  // เริ่มการทำงานของงานที่หยุดอยู่
  async resumeJob(jobId: string) {
    const job = await this.jobRepository.findOneBy({ id: jobId });
    if (job && job.status === "paused") {
      job.status = "idle";
      await this.jobRepository.save(job);
      this.scheduleJob(job);
    }
  }

  // ประมวลผลการทำงานของงาน
  private async executeJob(job: CronJob) {
    console.log(`Executing job: ${job.name}`);
    
    // สร้าง log บันทึกการทำงาน
    const log = new JobLog();
    log.jobId = job.id;
    log.status = "running";
    log.startTime = new Date();
    log.output = "";
    await this.logRepository.save(log);

    try {
      // อัพเดทสถานะงานเป็น running
      await this.jobRepository.update(job.id, { 
        status: "running", 
        lastRun: new Date() 
      });

      // จำลองการทำงานของคำสั่ง (ในการใช้งานจริงควรใช้ child_process หรือวิธีอื่น)
      const startTime = Date.now();
      const output = await this.simulateCommand(job.command);
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // เป็นวินาที

      // อัพเดท log
      log.status = "success";
      log.endTime = new Date();
      log.duration = duration;
      log.output = output;
      await this.logRepository.save(log);

      // อัพเดทข้อมูลงาน
      job.status = "success";
      job.successCount = (job.successCount || 0) + 1;
      job.averageRuntime = job.averageRuntime 
        ? (job.averageRuntime * (job.successCount - 1) + duration) / job.successCount
        : duration;
      
      await this.jobRepository.save(job);
    } catch (error) {
      // กรณีเกิดข้อผิดพลาด
      log.status = "failed";
      log.endTime = new Date();
      log.duration = (Date.now() - log.startTime.getTime()) / 1000;
      log.error = error.message || "Unknown error";
      await this.logRepository.save(log);

      // อัพเดทข้อมูลงาน
      job.status = "failed";
      job.failCount = (job.failCount || 0) + 1;
      await this.jobRepository.save(job);
    }
  }

  // จำลองการทำงานของคำสั่ง (สำหรับตัวอย่างเท่านั้น)
  private async simulateCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // จำลองการทำงานที่ใช้เวลาระหว่าง 1-5 วินาที
      const executionTime = Math.floor(Math.random() * 4000) + 1000;
      const shouldSucceed = Math.random() > 0.2; // 80% โอกาสที่จะสำเร็จ

      setTimeout(() => {
        if (shouldSucceed) {
          resolve(`Command executed successfully: ${command}\nOutput: Simulation of command execution.`);
        } else {
          reject(new Error(`Command failed: ${command}`));
        }
      }, executionTime);
    });
  }

  // แปลง schedule expression เป็นมิลลิวินาที (ตัวอย่างง่ายๆ)
  private parseScheduleToMilliseconds(schedule: string): number {
    // ในตัวอย่างนี้เราใช้วิธีง่ายๆ สำหรับการจำลองเท่านั้น
    // ในการใช้งานจริงควรใช้ไลบรารีสำหรับ cron expressions
    
    // สำหรับตัวอย่าง เราจะสมมติว่าค่าที่ส่งมาเป็นจำนวนวินาทีโดยตรง
    try {
      const seconds = parseInt(schedule, 10);
      return seconds * 1000; // แปลงเป็นมิลลิวินาที
    } catch {
      // ถ้าแปลงไม่ได้ ให้ใช้ค่าเริ่มต้น 60 วินาที
      return 60 * 1000;
    }
  }
}

// สร้าง Singleton instance
export const schedulerService = new SchedulerService();
