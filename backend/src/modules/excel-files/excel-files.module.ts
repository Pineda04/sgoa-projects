import { Module } from '@nestjs/common';
import { ExcelFilesService } from './services/excel-files.service';
import { ExcelFilesController } from './controllers/excel-files.controller';

@Module({
  controllers: [ExcelFilesController],
  providers: [ExcelFilesService],
  exports: [ExcelFilesService],
})
export class ExcelFilesModule {}
