import { Body, Controller, Post } from "@nestjs/common";
import type { CreateProductRequest } from "@repo/types";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(readonly productsService: ProductsService) {}

  @Post()
  createProduct(@Body() _createProductRequest: CreateProductRequest) {
    this.productsService.createProduct(_createProductRequest);
  }
}
