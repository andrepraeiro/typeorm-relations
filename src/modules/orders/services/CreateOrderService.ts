import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer dont exists', 400);
    }

    const findProducts = await this.productsRepository.findAllById(products);

    if (!findProducts || findProducts.length === 0) {
      throw new AppError('Products not found', 400);
    }

    const prod = findProducts.map(t => {
      const index = products.findIndex(item => item.id === t.id);
      return {
        product_id: t.id,
        price: t.price,
        quantity: products[index].quantity,
        availableQuantity: t.quantity,
      };
    });

    const productWithoutAvailableQuantity = prod.some(
      product => product.quantity > product.availableQuantity,
    );

    if (productWithoutAvailableQuantity) {
      throw new AppError('There are products without available quantity', 400);
    }

    const updateQuantity = prod.map(item => {
      return {
        id: item.product_id,
        quantity: item.quantity,
      };
    });

    await this.productsRepository.updateQuantity(updateQuantity);

    const order = await this.ordersRepository.create({
      customer,
      products: prod,
    });

    return order;
  }
}

export default CreateOrderService;
