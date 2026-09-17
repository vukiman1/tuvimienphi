import { BaseEntity } from '@org/backend-base';
import { Column, Entity } from 'typeorm';

@Entity('ad_redirects')
export class AdRedirectEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, name: 'label' })
  label!: string;

  @Column({ type: 'varchar', length: 255, name: 'slug' })
  slug!: string;

  @Column({ type: 'varchar', length: 500, name: 'target' })
  target!: string;

  @Column({ type: 'int', name: 'clicks', default: 0 })
  clicks!: number;

  @Column({ type: 'boolean', name: 'active', default: true })
  active!: boolean;
}
