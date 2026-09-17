import { BaseEntity } from '@org/backend-base';
import { Column, Entity } from 'typeorm';

@Entity('ad_popups')
export class AdPopupEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, name: 'name' })
  name!: string;

  @Column({ type: 'varchar', length: 30, name: 'trigger' })
  trigger!: string;

  @Column({ type: 'varchar', length: 500, name: 'image' })
  image!: string;

  @Column({ type: 'varchar', length: 500, name: 'target' })
  target!: string;

  @Column({ type: 'int', name: 'impressions', default: 0 })
  impressions!: number;

  @Column({ type: 'int', name: 'clicks', default: 0 })
  clicks!: number;

  @Column({ type: 'boolean', name: 'active', default: true })
  active!: boolean;
}
