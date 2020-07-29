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
    // const returnedProducts = await this.ormRepository.findByIds(products);
    const updatedProducts: Product[] = [];
    const a = products.map(async product => {
      const Repositoryproduct = await this.ormRepository.findOne(product.id);
      if (Repositoryproduct) {
        Repositoryproduct.quantity -= product.quantity;
        const updatedProduct = await this.ormRepository.save(Repositoryproduct);
        updatedProducts.push(updatedProduct);
        return product;
      }

      throw new AppError('Product dont exists');
    });

    console.log(a);
    return updatedProducts;
  }
}

export default ProductsRepository;
