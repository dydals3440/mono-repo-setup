import { Injectable } from '@nestjs/common';
import { CreateProductRequest, Product } from '@repo/types';

@Injectable()
export class ProductsService {
  private readonly products: Product[] = [];

  createProduct(createProductRequest: CreateProductRequest): Product {
    const product: Product = {
      ...createProductRequest,
      id: Math.random().toString(36).substring(2, 15),
    };
    this.products.push(product);
    return product;
  }

  getProducts() {
    return this.products;
  }
}
