import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = this.ormRepository.findOne({
      where: { name },
    });
    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const returnedProducts = this.ormRepository.findByIds(products);
    return returnedProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    try {
      const updatedProducts: Product[] = [];
      const repositoryProducts = await this.ormRepository.findByIds(products);
      repositoryProducts.forEach(async product => {
        const index = products.findIndex(t => t.id === product.id);
        const prod = product;
        prod.quantity -= products[index].quantity;
        updatedProducts.push(prod);
      });
      await this.ormRepository.save(updatedProducts);

      return updatedProducts;
    } catch (error) {
      throw new AppError(error.message);
    }
  }
}

export default ProductsRepository;
