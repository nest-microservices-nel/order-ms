import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from '../common';
import { ChangeStatusOrderDto, FindOrderByStatusDto } from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern('findAllOrders')
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.ordersService.findAll(paginationDto);
  }

  @MessagePattern('findOneOrder')
  findOne(@Payload() id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern('changeOrderStatus')
  changeOrderStatus(@Payload() changeOrderStatusDto: ChangeStatusOrderDto) {
    return this.ordersService.changeOrderStatus(
      changeOrderStatusDto.id,
      changeOrderStatusDto.status,
    );
  }

  @MessagePattern('findAllByStatus')
  findAllByStatus(@Payload() findOrderByStatusDto: FindOrderByStatusDto) {
    return this.ordersService.findAllByStatus(findOrderByStatusDto.status, {
      limit: findOrderByStatusDto?.limit,
      page: findOrderByStatusDto?.page,
    });
  }
}
