import Joi from 'joi';

export const validateBlogPost = (data: any) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    categories: Joi.array().items(Joi.string()),
    tags: Joi.array().items(Joi.string()),
    featuredImage: Joi.string().uri().allow(''), // Allow empty strings
    seo: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      keywords: Joi.array().items(Joi.string()).required()
    }).required(),
    metaDescription: Joi.string().required(),
    authorBio: Joi.string().required(),
    altText: Joi.string().required(),
    references: Joi.string().required(),
    status: Joi.string().valid('draft', 'published').required() // Add status validation
  });

  return schema.validate(data);
};
