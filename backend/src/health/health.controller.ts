import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
