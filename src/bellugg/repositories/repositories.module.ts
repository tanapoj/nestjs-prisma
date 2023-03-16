import { Module, Provider } from '@nestjs/common';

import {PrismaClient} from '@prisma/client'

export const client = new PrismaClient()

const PrismaClientProvider: Provider = {
  provide: 'PrismaClient',
  useValue: client,
};

@Module({
  providers: [PrismaClientProvider],
  exports: [PrismaClientProvider],
})
export class RepositoriesModule {}
