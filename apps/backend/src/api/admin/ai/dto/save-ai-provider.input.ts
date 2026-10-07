import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { AiProvider } from '../../../../ai/ai-provider';

export const MAX_MODELS = 8;
export const MAX_MODEL_LENGTH = 60;
export const MIN_API_KEY_LENGTH = 10;
export const MAX_API_KEY_LENGTH = 400;

const NO_WHITESPACE = /^\S+$/;
const MODEL_ID = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;

@InputType()
export class SaveAiProviderInput {
  @Field(() => AiProvider)
  @IsEnum(AiProvider)
  provider!: AiProvider;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(MIN_API_KEY_LENGTH, MAX_API_KEY_LENGTH)
  @Matches(NO_WHITESPACE, { message: 'apiKey must not contain whitespace' })
  apiKey?: string | null;

  @Field(() => [String])
  @IsArray()
  @ArrayMaxSize(MAX_MODELS)
  @IsString({ each: true })
  @MaxLength(MAX_MODEL_LENGTH, { each: true })
  @Matches(MODEL_ID, { each: true, message: 'each model must be a model id' })
  models!: string[];
}
