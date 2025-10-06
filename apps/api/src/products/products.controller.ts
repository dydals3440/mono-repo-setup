import { Body, Controller, Post } from "@nestjs/common"
import type { CreateProductRequest } from "@repo/types"
import type { ProductsService } from "./products.service"

@Controller("products")
export class ProductsController {
  constructor(readonly _ProductsService: ProductsService) {}

  @Post()
  // biome-ignore lint/suspicious/noEmptyBlockStatements: we don't want to create a product in the controller
  async createProduct(@Body() _createProductRequest: CreateProductRequest) {}
}
