import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
  } from "typeorm";
  import { User } from "./User";
  
  @Entity("usermanagement")
  export class UserManagement {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column()
    userId!: number;
  
    @ManyToOne(() => User, (u) => u.managedBy, { eager: true })
    @JoinColumn({ name: "userId" })
    user!: User;
  
    @Column()
    managerId!: number;
  
    @ManyToOne(() => User, (u) => u.manages, { eager: true })
    @JoinColumn({ name: "managerId" })
    manager!: User;
  
    @Column({ type: "date" })
    startDate!: Date;
  
    @Column({ type: "date" })
    endDate!: Date;
  }
  