import {
  Field, InputType, Int, PartialType,
} from '@nestjs/graphql'

import { CreateWeaviateInput } from './create-weaviate.input'

@InputType()
export class UpdateWeaviateInput extends PartialType(CreateWeaviateInput) {
  @Field(() => Int)
  id: number
}
