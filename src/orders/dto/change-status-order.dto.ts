// import { PartialType } from '@nestjs/mapped-types';
// import { CreateOrderDto } from './create-order.dto';

import { IsEnum, IsUUID } from 'class-validator';
import { orderStatusList } from '../enum/order.enum';
import { OrderStatus } from '@prisma/client';

export class ChangeStatusOrderDto {
  // extends PartialType(CreateOrderDto)
  @IsUUID()
  id: string;

  @IsEnum(orderStatusList, {
    message: `Possible status values are ${orderStatusList}`,
  })
  status: OrderStatus;
}
