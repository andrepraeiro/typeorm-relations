import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const findOrder = container.resolve(FindOrderService);
    const order = await findOrder.execute({ id });
    return response.json(order);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { customer_id, products } = request.body;
    const createOrder = container.resolve(CreateOrderService);
    const order = await createOrder.execute({ customer_id, products });

    const order_products = order.order_products.map(product => ({
      price: product.price,
      product_id: product.product_id,
      quantity: product.quantity,
    }));

    return response.json({
      id: order.id,
      customer: {
        email: order.customer.email,
        id: order.customer.id,
        name: order.customer.name,
      },
      order_products,
    });
  }
}
