import { IsNumber, IsPositive } from 'class-validator';

export class OrderItem {
  @IsNumber()
  @IsPositive()
  productId: number;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
