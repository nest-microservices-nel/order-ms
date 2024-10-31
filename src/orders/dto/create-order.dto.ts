import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { OrderItemDto } from './order-item.dto';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: Array<OrderItemDto>;

  // @IsNumber()
  // @Min(1)
  // @IsPositive()
  // totalAmount: number;

  // @IsNumber()
  // @Min(1)
  // @IsPositive()
  // totalItems: number;

  // @IsEnum(orderStatusList, {
  //   message: `Possible status values are ${orderStatusList}`,
  // })
  // @IsOptional()
  // status: OrderStatus = OrderStatus.PENDING;

  // @IsBoolean()
  // @IsOptional()
  // paid: boolean = false;
}
