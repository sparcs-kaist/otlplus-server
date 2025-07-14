import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class CreateWeaviateInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number
}
