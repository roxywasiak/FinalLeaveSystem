import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
  } from "typeorm";
  import { Length } from "class-validator";
  import { LeaveRequest } from "../entity/LeaveRequest";
  
  @Entity("leavetype")
  export class LeaveType {
    @PrimaryGeneratedColumn({ name: "leaveTypeId" })
    leaveTypeId!: number;
  
    @Column({ type: "varchar", length: 50 })
    @Length(1, 50)
    name!: string;
  
    @Column({ type: "text" })
    description!: string;
  
    @Column({ type: "int" })
    initialBalance!: number;
  
    @Column({ type: "int" })
    maxRollOverDays!: number;
  
    @OneToMany(() => LeaveRequest, (lr) => lr.leaveType)
    leaveRequests!: LeaveRequest[];
  }
 
