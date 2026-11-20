import {
  isContentSlug,
  LEARNING_PROGRESS_MAX_SLUGS_PER_REQUEST,
  SaveLearningProgressPayload,
} from '@org/shared-contracts';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  ValidateBy,
  ValidationOptions,
} from 'class-validator';

function IsContentSlug(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isContentSlug',
      validator: {
        validate: (value: unknown): boolean => typeof value === 'string' && isContentSlug(value),
        defaultMessage: (): string => 'slug không hợp lệ',
      },
    },
    validationOptions,
  );
}

export class SaveLearningProgressDto implements SaveLearningProgressPayload {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(LEARNING_PROGRESS_MAX_SLUGS_PER_REQUEST)
  @IsContentSlug({ each: true })
  slugs!: string[];
}
