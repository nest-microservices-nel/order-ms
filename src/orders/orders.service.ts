import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from 'src/common';
import { OrderStatus, PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrdersService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('DATABASE SQLITE ORDERS CONNECTED.');
  }

  create(createOrderDto: CreateOrderDto) {
    return this.order.create({ data: createOrderDto });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalElements = await this.order.count();

    const orders = await this.order.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    const lastPage = Math.ceil(totalElements / limit);

    return {
      data: orders,
      metadata: {
        totalElements,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      throw new RpcException({
        message: `The order with id ${id} dont found.`,
        status: 400,
      });
    }

    return order;
  }

  async changeOrderStatus(id: string, status: OrderStatus) {
    await this.findOne(id);

    return await this.order.update({ data: { status }, where: { id } });
  }

  async findAllByStatus(status: OrderStatus, paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalElements = await this.order.count({ where: { status } });

    const orders = await this.order.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { status },
    });

    const lastPage = Math.ceil(totalElements / limit);

    return {
      data: orders,
      metadata: {
        totalElements,
        page,
        lastPage,
      },
    };
  }
}
