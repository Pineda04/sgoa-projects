import { Test, TestingModule } from '@nestjs/testing';
import { ContractTypesController } from '../contract-types.controller';
import { ContractTypesService } from '../../services/contract-types.service';

describe('ContractTypesController', () => {
  let controller: ContractTypesController;

  const mockContractTypesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractTypesController],
      providers: [ContractTypesService],
    })
      .overrideProvider(ContractTypesService)
      .useValue(mockContractTypesService)
      .compile();

    controller = module.get<ContractTypesController>(ContractTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
