import { forwardRef, Module } from '@nestjs/common';
import { TeachersModule } from '../teachers/teachers.module';
import { PostgradsController } from './controllers/postgrads.controller';
import { TeachersPostgradController } from './controllers/teachers-postgrad.controller';
import { TeachersUndergradController } from './controllers/teachers-undergrad.controller';
import { UndergradsController } from './controllers/undergrads.controller';
import { PostgradsService } from './services/postgrads.service';
import { TeachersPostgradService } from './services/teachers-postgrad.service';
import { TeachersUndergradService } from './services/teachers-undergrad.service';
import { UndergradsService } from './services/undergrads.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule, forwardRef(() => TeachersModule)],
  controllers: [
    PostgradsController,
    TeachersPostgradController,
    UndergradsController,
    TeachersUndergradController,
  ],
  providers: [
    PostgradsService,
    TeachersPostgradService,
    UndergradsService,
    TeachersUndergradService,
  ],
  exports: [
    TeachersPostgradService,
    PostgradsService,
    TeachersUndergradService,
    UndergradsService,
  ],
})
export class TeachersDegreesModule {}
