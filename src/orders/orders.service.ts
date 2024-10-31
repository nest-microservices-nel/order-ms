import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from 'src/common';
import { OrderStatus, PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from '../config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }
  private readonly logger = new Logger('OrdersService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('DATABASE SQLITE ORDERS CONNECTED.');
  }

  private async validateProductsIds(ids: Array<number>) {
    try {
      return await firstValueFrom(
        this.client.send({ cmd: 'validate_products_ids' }, ids),
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      const ids = createOrderDto.items.map((product) => product.productId);

      const products = await this.validateProductsIds(ids);

      let totalAmount = 0;
      let totalItems = 0;

      for (const product of products) {
        const productOrder = createOrderDto.items.find(
          (productOrder) => productOrder.productId == product.id,
        );

        totalAmount += product.price * productOrder.quantity;
        totalItems += productOrder.quantity;
      }
      console.log('🚀 ~ OrdersService ~ create ~ u:', totalAmount);
      console.log('🚀 ~ OrdersService ~ create ~ totalItems:', totalItems);

      return await this.order.create({
        data: {
          totalAmount,
          totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((productOrder) => {
                return {
                  productId: productOrder.productId,
                  price: products.find(
                    (product) => product.id == productOrder.productId,
                  ).price,
                  quantity: productOrder.quantity,
                };
              }),
            },
          },
        },
        include: {
          OrderItem: true,
        },
      });
    } catch (error) {
      throw new RpcException(error);
    }
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
      include: {
        OrderItem: true,
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
