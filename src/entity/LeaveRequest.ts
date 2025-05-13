import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from "typeorm";
  import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    Length,
  } from "class-validator";
  import { LeaveType } from "./LeaveType";
  import { User } from "./User";
  
  export enum LeaveStatus {
    Pending   = "Pending",
    Approved  = "Approved",
    Rejected  = "Rejected",
    Cancelled = "Cancelled",
  }
  
  @Entity("leaverequest")
  export class LeaveRequest {
    @PrimaryGeneratedColumn({ name: "leaveRequestId" })
    leaveRequestId!: number;
  
    @Column()
    userId!: number;
  
    @ManyToOne(() => User, (u) => u.leaveRequests, { eager: true })
    @JoinColumn({ name: "userId" })
    user!: User;
  
    @Column()
    leaveTypeId!: number;
  
    @ManyToOne(() => LeaveType, (lt) => lt.leaveRequests, { eager: true })
    @JoinColumn({ name: "leaveTypeId" })
    leaveType!: LeaveType;
  
    @Column({ type: "date" })
    @IsDate()
    startDate!: Date;
  
    @Column({ type: "date" })
    @IsDate()
    endDate!: Date;
  
    @Column({ type: "enum", enum: LeaveStatus, default: LeaveStatus.Pending })
    @IsEnum(LeaveStatus)
    status!: LeaveStatus;
  
    @Column({ type: "text" })
    @Length(0, 500)
    reason!: string;
  }
 
 
  