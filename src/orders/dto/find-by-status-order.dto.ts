import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common';
import { orderStatusList } from '../enum/order.enum';

export class FindOrderByStatusDto extends PaginationDto {
  @IsEnum(orderStatusList, {
    message: `Possible status values are ${orderStatusList}`,
  })
  @IsOptional()
  status;
}
