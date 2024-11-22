import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from '../common';
import {
  ChangeStatusOrderDto,
  FindOrderByStatusDto,
  PaidOrderDto,
} from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);

    const paymentSession = await this.ordersService.createPaymentSession(order);

    return paymentSession;
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

  @EventPattern('payment.succeeded')
  async paymentSucceeded(@Payload() paidOrder: PaidOrderDto) {
    this.ordersService.setPaidOrder(paidOrder);

    return;
  }
}
