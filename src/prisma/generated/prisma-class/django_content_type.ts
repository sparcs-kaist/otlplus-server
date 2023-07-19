import { auth_permission } from './auth_permission';
import { django_admin_log } from './django_admin_log';
import { ApiProperty } from '@nestjs/swagger';

export class django_content_type {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: String })
  app_label: string;

  @ApiProperty({ type: String })
  model: string;

  @ApiProperty({ isArray: true, type: () => auth_permission })
  auth_permission: auth_permission[];

  @ApiProperty({ isArray: true, type: () => django_admin_log })
  django_admin_log: django_admin_log[];
}
